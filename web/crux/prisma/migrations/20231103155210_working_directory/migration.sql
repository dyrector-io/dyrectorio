-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "workingDirectory" TEXT;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "workingDirectory" TEXT;
