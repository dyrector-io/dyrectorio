/*
  Warnings:

  - You are about to drop the column `name` on the `Deployment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[versionId,nodeId,prefix]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Deployment_versionId_name_key";

-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_versionId_nodeId_prefix_key" ON "Deployment"("versionId", "nodeId", "prefix");
