/*
  Warnings:

  - You are about to drop the `UserInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserInvite" DROP CONSTRAINT "UserInvite_teamId_fkey";

-- DropTable
DROP TABLE "UserInvite";

-- CreateTable
CREATE TABLE "UserInvitation" (
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "teamId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_userId_teamId_email_key" ON "UserInvitation"("userId", "teamId", "email");

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
