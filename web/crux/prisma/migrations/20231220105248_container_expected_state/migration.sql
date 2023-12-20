-- CreateEnum
CREATE TYPE "ExpectedState" AS ENUM ('running', 'waiting', 'exited');

-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "expectedState" "ExpectedState";
ALTER TABLE "ContainerConfig" ADD COLUMN     "expectedExitCode" INTEGER;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "expectedState" "ExpectedState";
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "expectedExitCode" INTEGER;
