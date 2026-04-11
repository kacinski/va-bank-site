-- CreateTable
CREATE TABLE IF NOT EXISTS "Meme" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meme_pkey" PRIMARY KEY ("id")
);
