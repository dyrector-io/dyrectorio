-- CreateEnum
CREATE TYPE "PipelineRunCreatorTypeEnum" AS ENUM ('user', 'eventWatcher');

-- CreateEnum
CREATE TYPE "PipelineTriggerEventEnum" AS ENUM ('imagePush', 'imagePull');

-- AlterTable
SELECT * INTO "_prisma_migrations_PipelineRun" FROM "PipelineRun";
DELETE FROM "PipelineRun";

ALTER TABLE "PipelineRun" ADD COLUMN     "creatorType" "PipelineRunCreatorTypeEnum" NOT NULL;

INSERT INTO "PipelineRun"
SELECT *, 'user' FROM "_prisma_migrations_PipelineRun";

DROP TABLE "_prisma_migrations_PipelineRun";

-- CreateTable
CREATE TABLE "PipelineEventWatcher" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "event" "PipelineTriggerEventEnum" NOT NULL,
    "trigger" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" UUID,
    "pipelineId" UUID NOT NULL,
    "registryId" UUID,

    CONSTRAINT "PipelineEventWatcher_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PipelineEventWatcher" ADD CONSTRAINT "PipelineEventWatcher_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineEventWatcher" ADD CONSTRAINT "PipelineEventWatcher_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
