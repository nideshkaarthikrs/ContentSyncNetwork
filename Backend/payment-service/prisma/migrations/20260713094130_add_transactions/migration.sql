-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'MARKETPLACE_SALE', 'ROYALTY');

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "userDisplayId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "sourceId" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");
