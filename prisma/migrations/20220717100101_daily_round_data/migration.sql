/*
  Warnings:

  - Added the required column `data` to the `DailyRound` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `DailyRound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyRound" ADD COLUMN     "data" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
