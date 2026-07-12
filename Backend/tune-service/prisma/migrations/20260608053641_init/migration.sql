-- CreateTable
CREATE TABLE "Tune" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "bpm" INTEGER,
    "audioUrl" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tune_pkey" PRIMARY KEY ("id")
);
