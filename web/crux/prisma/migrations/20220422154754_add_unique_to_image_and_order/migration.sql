/*
  Warnings:

  - A unique constraint covering the columns `[versionId,order]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_versionId_order_key" ON "Image"("versionId", "order");
