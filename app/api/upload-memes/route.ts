

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const { id, filename } = await req.json();
  if (!id || !filename) {
    return new Response(JSON.stringify({ error: "Missing id or filename" }), { status: 400 });
  }
  // Удалить из базы мемов
  await prisma.meme.delete({ where: { id } });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files").filter(Boolean) as File[];
  const title = formData.get("title") as string | null;
  if (!files.length) {
    return new Response(JSON.stringify({ error: "No files uploaded" }), { status: 400 });
  }

  const uploaded: { filename: string }[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${file.name}`;
    await prisma.meme.create({
      data: {
        filename,
        title,
        mimeType: file.type || "application/octet-stream",
        fileData: bytes,
      },
    });
    uploaded.push({ filename });
  }

  return new Response(JSON.stringify({ uploaded }), { status: 200 });
}
