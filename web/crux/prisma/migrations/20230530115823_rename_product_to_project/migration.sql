-- CreateEnum
CREATE TYPE "ProjectTypeEnum" AS ENUM ('simple', 'complex');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_productId_fkey";

-- DropIndex
DROP INDEX "Version_productId_name_key";

-- AlterTable
ALTER TABLE "Version"
RENAME "productId" TO "projectId";

ALTER TABLE "Product" RENAME TO "Project";

ALTER TABLE "Project"
alter "type" drop default,
ALTER "type" TYPE "ProjectTypeEnum" using cast("type" as varchar)::"ProjectTypeEnum",
alter "type" set default 'simple';

-- AlterTable
ALTER TABLE "Project" RENAME CONSTRAINT "Product_pkey" TO "Project_pkey";

-- DropEnum
DROP TYPE "ProductTypeEnum";

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_teamId_key" ON "Project"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Version_projectId_name_key" ON "Version"("projectId", "name");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
