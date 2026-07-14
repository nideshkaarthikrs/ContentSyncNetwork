-- CreateEnum
CREATE TYPE "FeedItemType" AS ENUM ('TUNE', 'VIDEO', 'PROJECT');

-- CreateTable
CREATE TABLE "feed_items" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "type" "FeedItemType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feed_items_createdAt_idx" ON "feed_items"("createdAt");
