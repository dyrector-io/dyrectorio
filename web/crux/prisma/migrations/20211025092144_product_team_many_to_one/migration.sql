/*
  Warnings:

  - You are about to drop the `_ProductToTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductToTeam" DROP CONSTRAINT "_ProductToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToTeam" DROP CONSTRAINT "_ProductToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "teamId" UUID;

-- DropTable
DROP TABLE "_ProductToTeam";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
