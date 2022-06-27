-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('created', 'restating', 'running', 'removing', 'paused', 'exited', 'dead');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('preparing', 'inProgress', 'successful', 'failed', 'obsolate');

-- CreateEnum
CREATE TYPE "DeploymentEventType" AS ENUM ('log', 'deploymentStatus', 'containerStatus');

-- CreateTable
CREATE TABLE "ParentVersion_Version" (
    "versionId" UUID NOT NULL,
    "parentVersionId" UUID NOT NULL,

    CONSTRAINT "ParentVersion_Version_pkey" PRIMARY KEY ("versionId","parentVersionId")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prefix" TEXT,
    "environment" JSONB,
    "versionId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instance" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ContainerStatus" NOT NULL,
    "deploymentId" UUID NOT NULL,
    "imageId" UUID NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstanceContainerConfig" (
    "id" UUID NOT NULL,
    "capabilities" JSONB,
    "config" JSONB,
    "environment" JSONB,
    "instanceId" UUID NOT NULL,

    CONSTRAINT "InstanceContainerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentEvent" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "DeploymentEventType" NOT NULL,
    "value" JSONB NOT NULL,
    "deploymentId" UUID NOT NULL,

    CONSTRAINT "DeploymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentVersion_Version_parentVersionId_key" ON "ParentVersion_Version"("parentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "InstanceContainerConfig_instanceId_key" ON "InstanceContainerConfig"("instanceId");

-- AddForeignKey
ALTER TABLE "ParentVersion_Version" ADD CONSTRAINT "ParentVersion_Version_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentVersion_Version" ADD CONSTRAINT "ParentVersion_Version_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanceContainerConfig" ADD CONSTRAINT "InstanceContainerConfig_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentEvent" ADD CONSTRAINT "DeploymentEvent_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
