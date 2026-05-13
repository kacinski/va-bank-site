import { prisma } from "@/lib/prisma";
import MemesClient from "./MemesClient";

export const dynamic = "force-dynamic";

export default async function MemesPage() {
  const memes = await prisma.meme.findMany({
    select: { id: true, filename: true, title: true },
    orderBy: { id: "desc" },
  });
  return <MemesClient memes={memes} />;
}
