/*
  Warnings:

  - A unique constraint covering the columns `[storageId]` on the table `ContainerConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storageId]` on the table `InstanceContainerConfig` will be added. If there are existing duplicate values, this will fail.
  - You are about to drop the column `importContainer` on the `ContainerConfig` table. All the data in the column will be lost.
  - You are about to drop the column `importContainer` on the `InstanceContainerConfig` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Storage" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "accessKey" TEXT,
    "secretKey" TEXT,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Storage_name_teamId_key" ON "Storage"("name", "teamId");

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ContainerConfig" DROP COLUMN "importContainer",
ADD COLUMN     "storageSet" BOOLEAN,
ADD COLUMN     "storageId" UUID,
ADD COLUMN     "storageConfig" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" DROP COLUMN "importContainer",
ADD COLUMN     "storageSet" BOOLEAN,
ADD COLUMN     "storageId" UUID,
ADD COLUMN     "storageConfig" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "ContainerConfig_storageId_key" ON "ContainerConfig"("storageId");

-- CreateIndex
CREATE UNIQUE INDEX "InstanceContainerConfig_storageId_key" ON "InstanceContainerConfig"("storageId");

-- AddForeignKey
ALTER TABLE "ContainerConfig" ADD CONSTRAINT "ContainerConfig_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanceContainerConfig" ADD CONSTRAINT "InstanceContainerConfig_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
