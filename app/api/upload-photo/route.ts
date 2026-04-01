import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs"; // Ensure Node.js runtime for file system access

export async function POST(req: NextRequest) {
  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }

  // Save file to public/images/galary
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadDir = path.join(process.cwd(), "public/images/galary");
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

  // Save to DB
  const prisma = new PrismaClient();
  await prisma.photo.create({ data: { filename, title } });

  return new Response(JSON.stringify({ filename }), { status: 200 });
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
