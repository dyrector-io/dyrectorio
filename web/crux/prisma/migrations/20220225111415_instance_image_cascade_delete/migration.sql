-- DropForeignKey
ALTER TABLE "Instance" DROP CONSTRAINT "Instance_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
