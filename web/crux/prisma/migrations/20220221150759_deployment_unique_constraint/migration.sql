/*
  Warnings:

  - A unique constraint covering the columns `[versionId,name]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Deployment_versionId_name_key" ON "Deployment"("versionId", "name");
