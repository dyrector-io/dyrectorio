/*
  Warnings:

  - You are about to drop the column `name` on the `Deployment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[versionId,nodeId,prefix]` on the table `Deployment` will be added. If there are existing duplicate values, this will fail.

*/

-- DropIndex
DROP INDEX "Deployment_versionId_name_key";

-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_versionId_nodeId_prefix_key" ON "Deployment"("versionId", "nodeId", "prefix");

-- Copy data
DROP TABLE IF EXISTS public._migration_deployment;
SELECT
  id, "description"
INTO public._migration_deployment
FROM public."Deployment";

-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "description",
ADD COLUMN     "note" TEXT;

-- Update values
UPDATE "Deployment" SET "note" = "_migration_deployment"."description"
FROM "_migration_deployment" WHERE "_migration_deployment".id = "Deployment".id;
