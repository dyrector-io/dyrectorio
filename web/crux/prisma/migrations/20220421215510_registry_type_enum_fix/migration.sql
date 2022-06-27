/*
  Warnings:

  - Changed the type of `type` on the `Registry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RegistryTypeEnum" AS ENUM ('v2', 'hub');

-- AlterTable
ALTER TABLE "Registry" DROP COLUMN "type",
ADD COLUMN     "type" "RegistryTypeEnum" NOT NULL;

-- DropEnum
DROP TYPE "RegistryType";
