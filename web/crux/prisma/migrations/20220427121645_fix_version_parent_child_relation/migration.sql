/*
  Warnings:

  - A unique constraint covering the columns `[versionId]` on the table `VersionsOnParentVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VersionsOnParentVersion_versionId_key" ON "VersionsOnParentVersion"("versionId");
