/*
  Warnings:

  - You are about to drop the column `cameraId` on the `Bed` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `DailyRound` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bed" DROP CONSTRAINT "Bed_cameraId_fkey";

-- DropForeignKey
ALTER TABLE "DailyRound" DROP CONSTRAINT "DailyRound_assetId_fkey";

-- AlterTable
ALTER TABLE "Bed" DROP COLUMN "cameraId";

-- AlterTable
ALTER TABLE "DailyRound" DROP COLUMN "assetId";
