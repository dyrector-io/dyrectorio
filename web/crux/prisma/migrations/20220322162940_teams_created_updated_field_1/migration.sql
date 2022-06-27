/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Registry" DROP CONSTRAINT "Registry_teamId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
