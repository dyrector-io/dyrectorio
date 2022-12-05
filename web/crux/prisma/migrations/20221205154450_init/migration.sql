-- CreateEnum
CREATE TYPE "UserInvitationStatusEnum" AS ENUM ('pending', 'expired', 'declined');

-- CreateEnum
CREATE TYPE "NetworkMode" AS ENUM ('none', 'host', 'bridge', 'overlay', 'ipvlan', 'macvlan');

-- CreateEnum
CREATE TYPE "DeploymentStrategy" AS ENUM ('recreate', 'rolling');

-- CreateEnum
CREATE TYPE "RestartPolicy" AS ENUM ('always', 'unlessStopped', 'no', 'onFailure');

-- CreateEnum
CREATE TYPE "ExposeStrategy" AS ENUM ('none', 'expose', 'exposeWithTls');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('owner', 'admin', 'user');

-- CreateEnum
CREATE TYPE "ProductTypeEnum" AS ENUM ('simple', 'complex');

-- CreateEnum
CREATE TYPE "VersionTypeEnum" AS ENUM ('incremental', 'rolling');

-- CreateEnum
CREATE TYPE "ContainerStateEnum" AS ENUM ('created', 'restarting', 'running', 'removing', 'paused', 'exited', 'dead');

-- CreateEnum
CREATE TYPE "DeploymentStatusEnum" AS ENUM ('preparing', 'inProgress', 'successful', 'failed', 'obsolate', 'downgraded');

-- CreateEnum
CREATE TYPE "DeploymentEventTypeEnum" AS ENUM ('log', 'deploymentStatus', 'containerStatus');

-- CreateEnum
CREATE TYPE "RegistryTypeEnum" AS ENUM ('v2', 'hub', 'gitlab', 'github', 'google');

-- CreateEnum
CREATE TYPE "RegistryNamespaceEnum" AS ENUM ('organization', 'user', 'group', 'project');

-- CreateEnum
CREATE TYPE "NodeTypeEnum" AS ENUM ('docker', 'k8s');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('discord', 'slack', 'teams');

-- CreateEnum
CREATE TYPE "NotificationEventTypeEnum" AS ENUM ('deploymentCreated', 'versionCreated', 'nodeAdded', 'userInvited');

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" VARCHAR(70) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvitation" (
    "userId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status" "UserInvitationStatusEnum" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "UsersOnTeams" (
    "userId" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRoleEnum" NOT NULL,
    "teamId" UUID NOT NULL,

    CONSTRAINT "UsersOnTeams_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "type" "NodeTypeEnum" DEFAULT 'docker',
    "description" TEXT,
    "icon" TEXT,
    "token" TEXT,
    "address" TEXT,
    "connectedAt" TIMESTAMPTZ(6),
    "disconnectedAt" TIMESTAMPTZ(6),
    "teamId" UUID NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registry" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "user" TEXT,
    "token" TEXT,
    "type" "RegistryTypeEnum" NOT NULL,
    "namespace" "RegistryNamespaceEnum",
    "imageNamePrefix" TEXT,
    "apiUrl" TEXT,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "description" TEXT,
    "type" "ProductTypeEnum" NOT NULL DEFAULT 'simple',
    "teamId" UUID NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "changelog" TEXT,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "type" "VersionTypeEnum" NOT NULL DEFAULT 'incremental',
    "productId" UUID NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionsOnParentVersion" (
    "versionId" UUID NOT NULL,
    "parentVersionId" UUID NOT NULL,

    CONSTRAINT "VersionsOnParentVersion_pkey" PRIMARY KEY ("versionId","parentVersionId")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "order" INTEGER NOT NULL,
    "versionId" UUID NOT NULL,
    "registryId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerConfig" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "environment" JSONB,
    "secrets" JSONB,
    "capabilities" JSONB,
    "expose" "ExposeStrategy" NOT NULL,
    "ingress" JSONB,
    "configContainer" JSONB,
    "importContainer" JSONB,
    "user" INTEGER,
    "tty" BOOLEAN NOT NULL,
    "ports" JSONB,
    "portRanges" JSONB,
    "volumes" JSONB,
    "commands" JSONB,
    "args" JSONB,
    "initContainers" JSONB,
    "logConfig" JSONB,
    "restartPolicy" "RestartPolicy" NOT NULL,
    "networkMode" "NetworkMode" NOT NULL,
    "networks" JSONB,
    "dockerLabels" JSONB,
    "deploymentStrategy" "DeploymentStrategy" NOT NULL,
    "healthCheckConfig" JSONB,
    "resourceConfig" JSONB,
    "proxyHeaders" BOOLEAN NOT NULL,
    "useLoadBalancer" BOOLEAN NOT NULL,
    "extraLBAnnotations" JSONB,
    "customHeaders" JSONB,
    "annotations" JSONB,
    "labels" JSONB,
    "imageId" UUID NOT NULL,

    CONSTRAINT "ContainerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "note" TEXT,
    "prefix" TEXT,
    "status" "DeploymentStatusEnum" NOT NULL,
    "environment" JSONB,
    "versionId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instance" (
    "id" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "state" "ContainerStateEnum",
    "deploymentId" UUID NOT NULL,
    "imageId" UUID NOT NULL,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstanceContainerConfig" (
    "id" UUID NOT NULL,
    "instanceId" UUID NOT NULL,
    "name" TEXT,
    "environment" JSONB,
    "secrets" JSONB,
    "capabilities" JSONB,
    "expose" "ExposeStrategy",
    "ingress" JSONB,
    "configContainer" JSONB,
    "importContainer" JSONB,
    "user" INTEGER,
    "tty" BOOLEAN,
    "ports" JSONB,
    "portRanges" JSONB,
    "volumes" JSONB,
    "commands" JSONB,
    "args" JSONB,
    "initContainers" JSONB,
    "logConfig" JSONB,
    "restartPolicy" "RestartPolicy",
    "networkMode" "NetworkMode",
    "networks" JSONB,
    "dockerLabels" JSONB,
    "deploymentStrategy" "DeploymentStrategy",
    "healthCheckConfig" JSONB,
    "resourceConfig" JSONB,
    "proxyHeaders" BOOLEAN,
    "useLoadBalancer" BOOLEAN,
    "extraLBAnnotations" JSONB,
    "customHeaders" JSONB,
    "annotations" JSONB,
    "labels" JSONB,

    CONSTRAINT "InstanceContainerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentEvent" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "DeploymentEventTypeEnum" NOT NULL,
    "value" JSONB NOT NULL,
    "deploymentId" UUID NOT NULL,

    CONSTRAINT "DeploymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "serviceCall" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6),
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "url" TEXT NOT NULL,
    "type" "NotificationTypeEnum" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" UUID NOT NULL,
    "event" "NotificationEventTypeEnum" NOT NULL,
    "notificationId" UUID NOT NULL,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_userId_teamId_email_key" ON "UserInvitation"("userId", "teamId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Node_name_teamId_key" ON "Node"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Registry_name_teamId_key" ON "Registry"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_teamId_key" ON "Product"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Version_productId_name_key" ON "Version"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "VersionsOnParentVersion_versionId_key" ON "VersionsOnParentVersion"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "VersionsOnParentVersion_parentVersionId_key" ON "VersionsOnParentVersion"("parentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerConfig_imageId_key" ON "ContainerConfig"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "InstanceContainerConfig_instanceId_key" ON "InstanceContainerConfig"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_name_teamId_key" ON "Notification"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEvent_event_notificationId_key" ON "NotificationEvent"("event", "notificationId");

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnTeams" ADD CONSTRAINT "UsersOnTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerConfig" ADD CONSTRAINT "ContainerConfig_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanceContainerConfig" ADD CONSTRAINT "InstanceContainerConfig_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeploymentEvent" ADD CONSTRAINT "DeploymentEvent_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
