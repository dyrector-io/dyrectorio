/*
  Warnings:

  - Made the column `user` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ALTER COLUMN "user" SET NOT NULL,
ALTER COLUMN "user" SET DEFAULT -1;
