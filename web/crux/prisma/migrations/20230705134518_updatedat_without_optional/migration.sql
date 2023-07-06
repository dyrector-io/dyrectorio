/*
  Warnings:

  - Made the column `updatedAt` on table `Deployment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Image` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Node` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Registry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Storage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Team` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Version` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Registry" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Storage" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Version" ALTER COLUMN "updatedAt" SET NOT NULL;
