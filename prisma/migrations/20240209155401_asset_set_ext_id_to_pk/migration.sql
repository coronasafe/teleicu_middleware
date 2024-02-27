/*
  Warnings:

  - The primary key for the `Asset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Asset` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Asset_externalId_key";

-- AlterTable
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Asset_pkey" PRIMARY KEY ("externalId");
