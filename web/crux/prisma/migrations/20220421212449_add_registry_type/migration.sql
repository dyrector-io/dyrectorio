/*
  Warnings:

  - Added the required column `type` to the `Registry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegistryType" AS ENUM ('v2', 'hub');

-- AlterTable
ALTER TABLE "Registry" ADD COLUMN     "type" "RegistryType" NOT NULL;
