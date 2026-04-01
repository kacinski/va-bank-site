// pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Пример создания записи
  if (req.method === 'POST') {
    const { name } = req.body;
    const created = await prisma.example.create({ data: { name } });
    return res.status(201).json(created);
  }
  // Пример получения всех записей
  if (req.method === 'GET') {
    const all = await prisma.example.findMany();
    return res.status(200).json(all);
  }
  res.status(405).end();
}
