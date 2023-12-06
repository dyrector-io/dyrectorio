-- CreateEnum
CREATE TYPE "ExpectedState" AS ENUM ('running', 'exited', 'ready', 'live');

-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "expectedState" "ExpectedState";

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "expectedState" "ExpectedState";
