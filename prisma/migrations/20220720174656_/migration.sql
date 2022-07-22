/*
  Warnings:

  - A unique constraint covering the columns `[ipAddress]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Asset_ipAddress_key" ON "Asset"("ipAddress");

-- CreateIndex
CREATE INDEX "Asset_externalId_ipAddress_idx" ON "Asset"("externalId", "ipAddress");
