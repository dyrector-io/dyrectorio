/*
  Warnings:

  - You are about to drop the column `imageConfig` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imageName` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `imageTag` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `ContainerConfig` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageId` to the `ContainerConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Made the column `versionId` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "capabilities" JSONB,
ADD COLUMN     "config" JSONB,
ADD COLUMN     "environment" JSONB,
ADD COLUMN     "imageId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "imageConfig",
DROP COLUMN "imageName",
DROP COLUMN "imageTag",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT NOT NULL,
ALTER COLUMN "versionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ContainerConfig_imageId_key" ON "ContainerConfig"("imageId");

-- AddForeignKey
ALTER TABLE "ContainerConfig" ADD CONSTRAINT "ContainerConfig_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
