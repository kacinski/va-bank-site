// scripts/import-photos-again.js
// Импортировать все фото из папки public/images/galary в базу Photo (повторно)
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dir = path.join(process.cwd(), 'public/images/galary');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
  for (const filename of files) {
    const existingPhoto = await prisma.photo.findFirst({ where: { filename } });
    if (!existingPhoto) {
      await prisma.photo.create({
        data: { filename, title: null },
      });
    }
    console.log('Imported:', filename);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
