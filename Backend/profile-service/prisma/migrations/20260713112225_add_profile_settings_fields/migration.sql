-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "primaryRole" TEXT,
ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
