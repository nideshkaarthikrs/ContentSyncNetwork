-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW', 'INVITE', 'VOTE_RECEIVED', 'MARKETPLACE_SALE', 'COPYRIGHT_CLAIM', 'SYSTEM');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "sourceId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipientUserId_createdAt_idx" ON "notifications"("recipientUserId", "createdAt");
