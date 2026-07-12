-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "voterId" TEXT NOT NULL,
    "voterUserId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_voterId_entityId_entityType_key" ON "Vote"("voterId", "entityId", "entityType");
