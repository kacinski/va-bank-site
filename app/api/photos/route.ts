import { prisma } from '@/lib/prisma';

export async function GET() {
  const photos = await prisma.photo.findMany({
    select: {
      id: true,
      filename: true,
      title: true,
      folder: true,
      gameDate: true,
      createdAt: true,
    },
    orderBy: [
      { gameDate: 'desc' },
      { createdAt: 'desc' },
      { filename: 'asc' },
    ],
  });
  return Response.json(photos);
}
