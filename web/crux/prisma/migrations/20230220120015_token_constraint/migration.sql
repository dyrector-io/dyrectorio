/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,nonce]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Token_name_key";

-- DropIndex
DROP INDEX "Token_nonce_key";

-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_name_nonce_key" ON "Token"("userId", "name", "nonce");
