/*
  Warnings:

  - The primary key for the `UserInvite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `ParentVersion__Version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User__Team` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,teamId,email]` on the table `UserInvite` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `UserInvite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamId` on the `UserInvite` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ParentVersion__Version" DROP CONSTRAINT "ParentVersion__Version_parentVersionId_fkey";

-- DropForeignKey
ALTER TABLE "ParentVersion__Version" DROP CONSTRAINT "ParentVersion__Version_versionId_fkey";

-- AlterTable
ALTER TABLE "UserInvite" DROP CONSTRAINT "UserInvite_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "teamId",
ADD COLUMN     "teamId" UUID NOT NULL,
ADD CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("userId", "teamId");

-- DropTable
DROP TABLE "ParentVersion__Version";

-- DropTable
DROP TABLE "User__Team";

-- CreateTable
CREATE TABLE "UsersOnTeams" (
    "userId" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "teamId" UUID NOT NULL,

    CONSTRAINT "UsersOnTeams_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "VersionsOnParentVersion" (
    "versionId" UUID NOT NULL,
    "parentVersionId" UUID NOT NULL,

    CONSTRAINT "VersionsOnParentVersion_pkey" PRIMARY KEY ("versionId","parentVersionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "VersionsOnParentVersion_parentVersionId_key" ON "VersionsOnParentVersion"("parentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_userId_teamId_email_key" ON "UserInvite"("userId", "teamId", "email");

-- AddForeignKey
ALTER TABLE "UsersOnTeams" ADD CONSTRAINT "UsersOnTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
