

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export async function DELETE(req: NextRequest) {
  const { id, filename } = await req.json();
  if (!id || !filename) {
    return new Response(JSON.stringify({ error: "Missing id or filename" }), { status: 400 });
  }
  // Удалить из базы мемов
  await prisma.meme.delete({ where: { id } });
  // Удалить файл
  const filePath = path.join(process.cwd(), "public/images/memes", filename);
  try {
    await fs.unlink(filePath);
  } catch (e) {
    // Файл мог быть уже удалён, не критично
  }
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

  const uploadDir = path.join(process.cwd(), "public/images/memes");
  await fs.mkdir(uploadDir, { recursive: true });
  const uploaded: { filename: string }[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name) || ".jpg";
    const base = path.basename(file.name, ext);
    let filename = base + "-" + Date.now() + Math.floor(Math.random()*10000) + ext;
    let filePath = path.join(uploadDir, filename);
    let i = 1;
    while (await fileExists(filePath)) {
      filename = `${base}-${Date.now()}-${i}${ext}`;
      filePath = path.join(uploadDir, filename);
      i++;
    }
    await fs.writeFile(filePath, buffer);
    await prisma.meme.create({ data: { filename, title } });
    uploaded.push({ filename });
  }

  return new Response(JSON.stringify({ uploaded }), { status: 200 });
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
