-- DropForeignKey
ALTER TABLE "VersionsOnParentVersion" DROP CONSTRAINT "VersionsOnParentVersion_versionId_fkey";

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
