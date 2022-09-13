/*
  Warnings:

  - Added the required column `secrets` to the `ContainerConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "secrets" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "secrets" JSONB;
