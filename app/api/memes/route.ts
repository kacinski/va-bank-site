import { prisma } from '@/lib/prisma';

export async function GET() {
  const memes = await prisma.meme.findMany({ orderBy: { id: 'desc' } });
  return Response.json(memes);
}
