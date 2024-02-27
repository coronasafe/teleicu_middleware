-- DropForeignKey
ALTER TABLE "Bed" DROP CONSTRAINT "Bed_cameraExternalId_fkey";

-- DropForeignKey
ALTER TABLE "DailyRound" DROP CONSTRAINT "DailyRound_assetExternalId_fkey";

-- AlterTable
ALTER TABLE "Bed" ALTER COLUMN "cameraExternalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_cameraExternalId_fkey" FOREIGN KEY ("cameraExternalId") REFERENCES "Asset"("externalId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRound" ADD CONSTRAINT "DailyRound_assetExternalId_fkey" FOREIGN KEY ("assetExternalId") REFERENCES "Asset"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;
