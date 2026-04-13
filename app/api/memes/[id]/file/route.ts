import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const memeId = Number(id);

  if (!Number.isInteger(memeId) || memeId <= 0) {
    return new Response("Invalid meme id", { status: 400 });
  }

  const meme = await prisma.meme.findUnique({
    where: { id: memeId },
    select: {
      filename: true,
      mimeType: true,
      fileData: true,
    },
  });

  if (!meme) {
    return new Response("Meme not found", { status: 404 });
  }

  if (meme.fileData) {
    return new Response(meme.fileData, {
      status: 200,
      headers: {
        "Content-Type": meme.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const fallbackUrl = new URL(`/images/memes/${encodeURIComponent(meme.filename)}`, request.url);
  return Response.redirect(fallbackUrl, 307);
}
