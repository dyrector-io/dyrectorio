-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "metrics" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "metrics" JSONB;
