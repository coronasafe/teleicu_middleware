/*
  Warnings:

  - The values [CAMERA,MONITOR] on the enum `AssetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetType_new" AS ENUM ('ONVIF', 'HL7MONITOR', 'VENTILATOR');
ALTER TABLE "Asset" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Asset" ALTER COLUMN "type" TYPE "AssetType_new" USING ("type"::text::"AssetType_new");
ALTER TYPE "AssetType" RENAME TO "AssetType_old";
ALTER TYPE "AssetType_new" RENAME TO "AssetType";
DROP TYPE "AssetType_old";
ALTER TABLE "Asset" ALTER COLUMN "type" SET DEFAULT 'HL7MONITOR';
COMMIT;
