/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function parseDateFromFilename(filename) {
  const match = filename.match(/^(\d{1,2})_(\d{1,2})_(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function buildGameFolder(date) {
  const day = date.getUTCDate();
  const monthName = MONTHS_RU[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${monthName} ${year}`;
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "application/octet-stream";
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
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
      gameDate: true,
      createdAt: true,
      fileData: true,
      mimeType: true,
      folder: true,
    },
    orderBy: { id: "asc" },
  });

  let updated = 0;

  for (const photo of photos) {
    const effectiveDate = photo.gameDate || parseDateFromFilename(photo.filename) || photo.createdAt;
    const targetFolder = buildGameFolder(effectiveDate);
    const targetDir = path.join(galleryRoot, targetFolder);
    const targetPath = path.join(targetDir, photo.filename);

    const legacyRootPath = path.join(galleryRoot, photo.filename);
    const currentFolderPath = photo.folder ? path.join(galleryRoot, photo.folder, photo.filename) : null;

    let sourcePath = null;
    if (await fileExists(targetPath)) {
      sourcePath = targetPath;
    } else if (currentFolderPath && await fileExists(currentFolderPath)) {
      sourcePath = currentFolderPath;
    } else if (await fileExists(legacyRootPath)) {
      sourcePath = legacyRootPath;
    }

    let fileData = photo.fileData;
    if (!fileData && sourcePath) {
      fileData = await fs.readFile(sourcePath);
    }

    await ensureDir(targetDir);
    if (sourcePath && sourcePath !== targetPath) {
      await fs.rename(sourcePath, targetPath);
    }

    if (!fileData) {
      console.warn(`skip photo id=${photo.id}, missing source file ${photo.filename}`);
      continue;
    }

    await prisma.photo.update({
      where: { id: photo.id },
      data: {
        gameDate: photo.gameDate || effectiveDate,
        folder: targetFolder,
        mimeType: photo.mimeType || getMimeType(photo.filename),
        fileData,
      },
    });

    updated += 1;
  }

  console.log(`updated ${updated} photos`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
