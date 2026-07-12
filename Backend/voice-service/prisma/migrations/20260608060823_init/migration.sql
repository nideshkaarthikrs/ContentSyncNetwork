-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "tuneId" TEXT NOT NULL,
    "lyricsId" TEXT NOT NULL,
    "singerId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "pitchScore" INTEGER,
    "clarityScore" INTEGER,
    "rhythmScore" INTEGER,
    "overallScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);
