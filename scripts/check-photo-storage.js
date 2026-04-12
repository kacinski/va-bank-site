/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const galleryRoot = path.join(process.cwd(), "public", "images", "galary");
  const photos = await prisma.photo.findMany({
    select: {
      id: true,
      filename: true,
      folder: true,
      fileData: true,
      mimeType: true,
    },
    orderBy: { id: "asc" },
  });

  const total = photos.length;
  let missingBytes = 0;
  let missingFolder = 0;
  let missingFileOnDisk = 0;

  for (const photo of photos) {
    if (!photo.fileData || photo.fileData.length === 0) {
      missingBytes += 1;
    }

    if (!photo.folder) {
      missingFolder += 1;
      continue;
    }

    const absolutePath = path.join(galleryRoot, photo.folder, photo.filename);
    if (!(await exists(absolutePath))) {
      missingFileOnDisk += 1;
    }
  }

  console.log(JSON.stringify({
    total,
    missingBytes,
    missingFolder,
    missingFileOnDisk,
    ok: missingBytes === 0 && missingFolder === 0 && missingFileOnDisk === 0,
  }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
