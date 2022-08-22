-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "secrets" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "secrets" JSONB;
