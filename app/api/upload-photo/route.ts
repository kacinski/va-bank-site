import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  const gameDateValue = formData.get("gameDate") as string | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }

  const gameDate = gameDateValue ? new Date(`${gameDateValue}T12:00:00.000Z`) : null;
  if (gameDate && Number.isNaN(gameDate.getTime())) {
    return new Response(JSON.stringify({ error: "Invalid game date" }), { status: 400 });
  }

  // Persist binary data in DB (Vercel-friendly: no filesystem writes in function bundle).
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique filename
  const normalizedName = file.name || "photo.jpg";
  const dot = normalizedName.lastIndexOf(".");
  const ext = dot > -1 ? normalizedName.slice(dot) : ".jpg";
  const base = dot > -1 ? normalizedName.slice(0, dot) : normalizedName;
  const filename = `${base}-${Date.now()}${ext}`;

  // Save to DB (binary + metadata)
  await prisma.photo.create({
    data: {
      filename,
      title,
      gameDate,
      mimeType: file.type || "application/octet-stream",
      fileData: buffer,
      folder: buildGameFolder(gameDate),
    },
  });

  return new Response(JSON.stringify({ filename }), { status: 200 });
}

function buildGameFolder(gameDate: Date | null) {
  const target = gameDate ?? new Date();
  const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(target);
  const day = target.getUTCDate();
  const year = target.getUTCFullYear();
  return `${day} ${monthName} ${year}`;
}
