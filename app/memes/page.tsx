import MemesClient from "./MemesClient";
import { prisma } from "@/lib/prisma";

export default async function MemesPage() {
  const memes = await prisma.meme.findMany({
    orderBy: { id: "desc" },
  });
  return <MemesClient memes={memes} />;
}
