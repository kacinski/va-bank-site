import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const photos = await prisma.photo.findMany({ orderBy: { filename: 'asc' } });
  return Response.json(photos);
}
