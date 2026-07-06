/* eslint-disable no-console */
// One-time migration: upload all photos from DB binary storage to Vercel Blob
require("dotenv").config({ path: ".env.local" });

const { put } = require("@vercel/blob");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Fetch IDs only first to avoid loading all blobs into memory
  const ids = await prisma.photo.findMany({
    where: { url: null },
    select: { id: true },
  });

  console.log(`Found ${ids.length} photos to migrate`);

  let migrated = 0;
  let failed = 0;

  for (const { id } of ids) {
    const photo = await prisma.photo.findUnique({
      where: { id },
      select: { id: true, filename: true, mimeType: true, fileData: true },
    });

    if (!photo?.fileData) {
      console.log(`  skip (no fileData): id=${id}`);
      continue;
    }

    try {
      const blob = await put(`gallery/${photo.filename}`, photo.fileData, {
        access: "public",
        contentType: photo.mimeType || "image/jpeg",
      });

      await prisma.photo.update({
        where: { id: photo.id },
        data: { url: blob.url },
      });

      console.log(`  [${++migrated}/${ids.length}] ${photo.filename} → ${blob.url}`);
    } catch (err) {
      console.error(`  FAILED: ${photo.filename}`, err.message);
      failed++;
    }
  }

  await prisma.$disconnect();
  console.log(`\nDone. Migrated: ${migrated}, failed: ${failed}`);
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
