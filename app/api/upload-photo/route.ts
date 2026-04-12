import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs"; // Ensure Node.js runtime for file system access

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

  // Save file to public/images/galary/<game folder>
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadRoot = path.join(process.cwd(), "public/images/galary");
  const uploadDir = path.join(uploadRoot, buildGameFolder(gameDate));
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const ext = path.extname(file.name) || ".jpg";
  const base = path.basename(file.name, ext);
  let filename = base + "-" + Date.now() + ext;
  let filePath = path.join(uploadDir, filename);
  // Ensure no overwrite
  let i = 1;
  while (await fileExists(filePath)) {
    filename = `${base}-${Date.now()}-${i}${ext}`;
    filePath = path.join(uploadDir, filename);
    i++;
  }
  await fs.writeFile(filePath, buffer);

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

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
