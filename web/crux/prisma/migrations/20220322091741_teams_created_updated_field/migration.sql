/*
  Warnings:

  - Added the required column `createdBy` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedBy" UUID;
