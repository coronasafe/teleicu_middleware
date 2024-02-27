/*
  Warnings:

  - Added the required column `cameraExternalId` to the `Bed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetExternalId` to the `DailyRound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bed" ADD COLUMN     "cameraExternalId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DailyRound" ADD COLUMN     "assetExternalId" TEXT NOT NULL;

-- fill in the new columns with the existing data
UPDATE "Bed"
SET "cameraExternalId" = (
  SELECT "externalId"
  FROM "Asset"
  WHERE "Bed"."cameraId" = "Asset"."id"
);

UPDATE "DailyRound"
SET "assetExternalId" = (
  SELECT "externalId"
  FROM "Asset"
  WHERE "DailyRound"."assetId" = "Asset"."id"
);