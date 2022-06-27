/*
  Warnings:

  - You are about to drop the column `certFilePath` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `keyFilePath` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "certFilePath",
DROP COLUMN "keyFilePath";
