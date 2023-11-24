-- CreateEnum
CREATE TYPE "PipelineTypeEnum" AS ENUM ('github', 'gitlab', 'azure');

-- CreateEnum
CREATE TYPE "PipelineStatusEnum" AS ENUM ('unknown', 'queued', 'running', 'successful', 'failed');

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "type" "PipelineTypeEnum" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "token" TEXT NOT NULL,
    "repository" JSONB NOT NULL,
    "trigger" JSONB NOT NULL,
    "hooks" JSONB NOT NULL,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" UUID NOT NULL,
    "externalId" INTEGER NOT NULL,
    "status" "PipelineStatusEnum" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "pipelineId" UUID NOT NULL,

    CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_name_teamId_key" ON "Pipeline"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineRun_pipelineId_externalId_key" ON "PipelineRun"("pipelineId", "externalId");

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
