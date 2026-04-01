
import GalleryClient from "./GalleryClient";
import { PrismaClient } from "@prisma/client";

export default async function GalleryPage() {
  const prisma = new PrismaClient();
  const photos = await prisma.photo.findMany({ orderBy: { filename: "asc" } });
  return <GalleryClient photos={photos} />;
}
