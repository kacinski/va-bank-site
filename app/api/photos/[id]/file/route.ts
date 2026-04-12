import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

  return new Response("Photo data missing in DB", { status: 404 });
}
