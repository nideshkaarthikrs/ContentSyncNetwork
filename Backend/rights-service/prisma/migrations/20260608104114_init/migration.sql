-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('TUNE', 'SONG', 'VIDEO');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('AVAILABLE', 'SOLD', 'PENDING');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "rights_listings" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "territory" TEXT,
    "term" TEXT,
    "price" INTEGER NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rights_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copyright_claims" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "claimantUserId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copyright_claims_pkey" PRIMARY KEY ("id")
);
