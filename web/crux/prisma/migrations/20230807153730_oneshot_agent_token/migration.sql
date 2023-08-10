/*
  Warnings:

  - You are about to drop the column `token` on the `Node` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AgentEventTypeEnum" ADD VALUE 'installed';

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "token";

-- CreateTable
CREATE TABLE "NodeToken" (
    "nodeId" UUID NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "NodeToken_pkey" PRIMARY KEY ("nodeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NodeToken_nodeId_key" ON "NodeToken"("nodeId");

-- AddForeignKey
ALTER TABLE "NodeToken" ADD CONSTRAINT "NodeToken_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
