/* eslint-disable no-console */
// One-time import of 18 April 2026 game photos from a local folder into DB + public gallery.
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/kacinski/Va_Bank/Photos-3-001";
const GAME_DATE = new Date("2026-04-18T12:00:00.000Z");
const FOLDER_NAME = "18 апреля 2026";

async function main() {
  const galleryDir = path.join(process.cwd(), "public", "images", "galary", FOLDER_NAME);
  await fs.mkdir(galleryDir, { recursive: true });

  const files = (await fs.readdir(SOURCE_DIR)).filter(f =>
    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f)
  );

  console.log(`Found ${files.length} files in ${SOURCE_DIR}`);

  let imported = 0;
  let skipped = 0;

  for (const originalName of files) {
    const sourcePath = path.join(SOURCE_DIR, originalName);

    // Check if already imported by original filename
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

    // Copy to public gallery folder so dev server can serve it statically
    const destPath = path.join(galleryDir, originalName);
    await fs.copyFile(sourcePath, destPath);

    console.log("  imported:", originalName);
    imported++;
  }

  await prisma.$disconnect();
  console.log(`\nDone. Imported: ${imported}, skipped: ${skipped}.`);
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
