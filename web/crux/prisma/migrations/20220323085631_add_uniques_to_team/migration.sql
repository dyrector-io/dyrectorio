/*
  Warnings:

  - A unique constraint covering the columns `[name,teamId]` on the table `Node` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,teamId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,teamId]` on the table `Registry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_name_key";

-- DropIndex
DROP INDEX "Registry_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Node_name_teamId_key" ON "Node"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_teamId_key" ON "Product"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Registry_name_teamId_key" ON "Registry"("name", "teamId");
