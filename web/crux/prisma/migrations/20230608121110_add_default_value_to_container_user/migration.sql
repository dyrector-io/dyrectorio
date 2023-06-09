/*
  Warnings:

  - Made the column `user` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user` on table `InstanceContainerConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ALTER COLUMN "user" SET NOT NULL,
ALTER COLUMN "user" SET DEFAULT -1;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "user" SET NOT NULL,
ALTER COLUMN "user" SET DEFAULT -1;
