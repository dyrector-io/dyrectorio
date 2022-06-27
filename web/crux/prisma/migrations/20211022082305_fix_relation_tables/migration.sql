/*
  Warnings:

  - You are about to drop the `Team__Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team__Registry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Team__Product" DROP CONSTRAINT "Team__Product_productId_fkey";

-- DropForeignKey
ALTER TABLE "Team__Product" DROP CONSTRAINT "Team__Product_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Team__Registry" DROP CONSTRAINT "Team__Registry_registryId_fkey";

-- DropForeignKey
ALTER TABLE "Team__Registry" DROP CONSTRAINT "Team__Registry_teamId_fkey";

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "teamId" UUID;

-- AlterTable
ALTER TABLE "Registry" ADD COLUMN     "teamId" UUID;

-- DropTable
DROP TABLE "Team__Product";

-- DropTable
DROP TABLE "Team__Registry";

-- CreateTable
CREATE TABLE "_ProductToTeam" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToTeam_AB_unique" ON "_ProductToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToTeam_B_index" ON "_ProductToTeam"("B");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTeam" ADD FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTeam" ADD FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
