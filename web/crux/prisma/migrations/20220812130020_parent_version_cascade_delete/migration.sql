-- DropForeignKey
ALTER TABLE "VersionsOnParentVersion" DROP CONSTRAINT "VersionsOnParentVersion_parentVersionId_fkey";

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
