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
    // Можно добавить генерацию title по имени файла или оставить пустым
    await prisma.photo.upsert({
      where: { filename },
      update: {},
      create: { filename, title: null },
    });
    console.log('Imported:', filename);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
