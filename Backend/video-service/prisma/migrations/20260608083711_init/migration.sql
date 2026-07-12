-- CreateEnum
CREATE TYPE "VideoProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PUBLISHED');

-- CreateTable
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "songId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "directorId" TEXT NOT NULL,
    "directorUserId" TEXT NOT NULL,
    "status" "VideoProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "videoProjectId" TEXT,
    "uploaderId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "VideoProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
