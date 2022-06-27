/*
  Warnings:

  - You are about to drop the `ParentVersion_Version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ParentVersion_Version" DROP CONSTRAINT "ParentVersion_Version_parentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "ParentVersion_Version" DROP CONSTRAINT "ParentVersion_Version_versionId_fkey";

-- DropTable
DROP TABLE "ParentVersion_Version";

-- CreateTable
CREATE TABLE "ParentVersion__Version" (
    "versionId" UUID NOT NULL,
    "parentVersionId" UUID NOT NULL,

    CONSTRAINT "ParentVersion__Version_pkey" PRIMARY KEY ("versionId","parentVersionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentVersion__Version_parentVersionId_key" ON "ParentVersion__Version"("parentVersionId");

-- AddForeignKey
ALTER TABLE "ParentVersion__Version" ADD CONSTRAINT "ParentVersion__Version_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentVersion__Version" ADD CONSTRAINT "ParentVersion__Version_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
