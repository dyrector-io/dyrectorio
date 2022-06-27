-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_registryId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_versionId_fkey";

-- DropIndex
DROP INDEX "Image_registryId_key";

-- DropIndex
DROP INDEX "Image_versionId_key";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
