-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_cameraExternalId_fkey" FOREIGN KEY ("cameraExternalId") REFERENCES "Asset"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRound" ADD CONSTRAINT "DailyRound_assetExternalId_fkey" FOREIGN KEY ("assetExternalId") REFERENCES "Asset"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;
