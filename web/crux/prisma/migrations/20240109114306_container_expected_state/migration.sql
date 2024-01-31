-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "expectedState" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "expectedState" JSONB;
