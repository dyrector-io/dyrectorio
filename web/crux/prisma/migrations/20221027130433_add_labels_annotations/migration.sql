-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "annotations" JSONB,
ADD COLUMN     "dockerLabels" JSONB,
ADD COLUMN     "labels" JSONB;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "annotations" JSONB,
ADD COLUMN     "dockerLabels" JSONB,
ADD COLUMN     "labels" JSONB;
