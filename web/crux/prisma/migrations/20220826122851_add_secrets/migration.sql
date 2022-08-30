/*
  Warnings:

  - The `secrets` column on the `ContainerConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" DROP COLUMN "secrets",
ADD COLUMN     "secrets" TEXT[];
