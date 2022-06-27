/*
  Warnings:

  - Made the column `teamId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teamId` on table `Registry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "teamId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Registry" ALTER COLUMN "teamId" SET NOT NULL;
