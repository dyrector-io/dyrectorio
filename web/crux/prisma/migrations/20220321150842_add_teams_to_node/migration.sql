/*
  Warnings:

  - Made the column `teamId` on table `Node` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_teamId_fkey";

-- DropIndex
DROP INDEX "Node_name_key";

-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "teamId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
