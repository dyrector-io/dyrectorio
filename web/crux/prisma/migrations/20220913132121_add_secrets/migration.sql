-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "secrets" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "capabilities" SET DEFAULT '[]',
ALTER COLUMN "config" SET DEFAULT '{}',
ALTER COLUMN "environment" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN     "secrets" JSONB;
