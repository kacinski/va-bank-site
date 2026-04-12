import GalleryClient from "./GalleryClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    select: {
      id: true,
      filename: true,
      title: true,
      gameDate: true,
      createdAt: true,
    },
    orderBy: [
      { gameDate: "desc" },
      { createdAt: "desc" },
      { filename: "asc" },
    ],
  });
  return <GalleryClient photos={photos} />;
}
