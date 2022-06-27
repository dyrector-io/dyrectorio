/*
  Warnings:

  - Changed the type of `status` on the `Deployment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `DeploymentEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Instance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContainerStatusEnum" AS ENUM ('created', 'restating', 'running', 'removing', 'paused', 'exited', 'dead');

-- CreateEnum
CREATE TYPE "DeploymentStatusEnum" AS ENUM ('preparing', 'inProgress', 'successful', 'failed', 'obsolate');

-- CreateEnum
CREATE TYPE "DeploymentEventTypeEnum" AS ENUM ('log', 'deploymentStatus', 'containerStatus');

-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "status",
ADD COLUMN     "status" "DeploymentStatusEnum" NOT NULL;

-- AlterTable
ALTER TABLE "DeploymentEvent" DROP COLUMN "type",
ADD COLUMN     "type" "DeploymentEventTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "status",
ADD COLUMN     "status" "ContainerStatusEnum" NOT NULL;

-- DropEnum
DROP TYPE "ContainerStatus";

-- DropEnum
DROP TYPE "DeploymentEventType";

-- DropEnum
DROP TYPE "DeploymentStatus";
