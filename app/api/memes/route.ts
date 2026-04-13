import { prisma } from '@/lib/prisma';

export async function GET() {
  const memes = await prisma.meme.findMany({
    select: { id: true, filename: true, title: true },
    orderBy: { id: 'desc' },
  });
  return Response.json(memes);
}
