/*
  Warnings:

  - Made the column `description` on table `Asset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "description" SET NOT NULL;
