/*
  Warnings:

  - A unique constraint covering the columns `[productId,name]` on the table `Version` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Version_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Version_productId_name_key" ON "Version"("productId", "name");
