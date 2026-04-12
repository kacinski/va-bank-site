import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

async function findFileByName(rootDir: string, fileName: string): Promise<string | null> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const found = await findFileByName(fullPath, fileName);
      if (found) return found;
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = Number(id);

  if (!Number.isInteger(photoId) || photoId <= 0) {
    return new Response("Invalid photo id", { status: 400 });
  }

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: {
      filename: true,
      folder: true,
      mimeType: true,
      fileData: true,
    },
  });

  if (!photo) {
    return new Response("Photo not found", { status: 404 });
  }

  if (photo.fileData) {
    return new Response(photo.fileData, {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Legacy fallback for records created before fileData existed.
  const galleryRoot = path.join(process.cwd(), "public/images/galary");
  const fallbackPath = path.join(galleryRoot, photo.folder || "", photo.filename);

  try {
    const fallbackData = await fs.readFile(fallbackPath);
    return new Response(fallbackData, {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    try {
      const recursivePath = await findFileByName(galleryRoot, photo.filename);
      if (recursivePath) {
        const fallbackData = await fs.readFile(recursivePath);
        return new Response(fallbackData, {
          status: 200,
          headers: {
            "Content-Type": photo.mimeType || "application/octet-stream",
            "Cache-Control": "public, max-age=300",
          },
        });
      }
    } catch {
      // Ignore recursive search errors and return 404 below.
    }

    return new Response("Photo data missing", { status: 404 });
  }
}
