/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/kacinski/Va_Bank/Photos-13-06";
const GAME_DATE = new Date("2026-06-13T12:00:00.000Z");
const FOLDER_NAME = "13 июня 2026 (выезд)";

async function main() {
  const galleryDir = path.join(process.cwd(), "public", "images", "gallery", FOLDER_NAME);
  await fs.mkdir(galleryDir, { recursive: true });

  const files = (await fs.readdir(SOURCE_DIR)).filter(f =>
    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f)
  );

  console.log(`Found ${files.length} files in ${SOURCE_DIR}`);

  let imported = 0;
  let skipped = 0;

  for (const originalName of files) {
    const sourcePath = path.join(SOURCE_DIR, originalName);

    const existing = await prisma.photo.findFirst({ where: { filename: originalName } });
    if (existing) {
      console.log("  skip (already in DB):", originalName);
      skipped++;
      continue;
    }

    const buffer = await fs.readFile(sourcePath);
    const ext = path.extname(originalName).toLowerCase();
    const mimeType =
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
      : ext === ".png" ? "image/png"
      : ext === ".webp" ? "image/webp"
      : ext === ".gif" ? "image/gif"
      : ext === ".avif" ? "image/avif"
      : "application/octet-stream";

    await prisma.photo.create({
      data: {
        filename: originalName,
        title: null,
        gameDate: GAME_DATE,
        mimeType,
        fileData: buffer,
        folder: FOLDER_NAME,
      },
    });

    const destPath = path.join(galleryDir, originalName);
    await fs.copyFile(sourcePath, destPath);

    console.log("  imported:", originalName);
    imported++;
  }

  await prisma.$disconnect();
  console.log(`\nDone. Imported: ${imported}, skipped: ${skipped}.`);
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
