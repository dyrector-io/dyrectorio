-- DropForeignKey
ALTER TABLE "ContainerConfig" DROP CONSTRAINT "ContainerConfig_imageId_fkey";

-- AddForeignKey
ALTER TABLE "ContainerConfig" ADD CONSTRAINT "ContainerConfig_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
