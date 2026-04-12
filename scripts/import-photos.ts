// scripts/import-photos.ts
// Скрипт для импорта файлов из public/images/galary в БД
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(process.cwd(), 'public/images/galary');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
  for (const filename of files) {
    const existingPhoto = await prisma.photo.findFirst({ where: { filename } });
    if (!existingPhoto) {
      await prisma.photo.create({
        data: { filename, title: null, gameDate: null },
      });
    }
    console.log('Imported:', filename);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
