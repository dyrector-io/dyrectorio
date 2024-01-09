/*
  Warnings:

  - You are about to drop the `_prisma_migrations_Registry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_prisma_migrations_Storage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "expectedState" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "expectedState" JSONB;

-- DropTable
DROP TABLE "_prisma_migrations_Registry";

-- DropTable
DROP TABLE "_prisma_migrations_Storage";
