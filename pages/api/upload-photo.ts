import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public/images/galary');
  form.keepExtensions = true;
  form.maxFileSize = 10 * 1024 * 1024; // 10MB

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Upload error' });
    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const filename = path.basename(file.path);
    await prisma.photo.create({ data: { filename, title: fields.title?.toString() || null } });
    res.status(200).json({ filename });
  });
}
