-- CreateEnum
CREATE TYPE "ContainerConfigType" AS ENUM ('image', 'instance', 'deployment', 'configBundle');

-- DropForeignKey
ALTER TABLE "ContainerConfig" DROP CONSTRAINT "ContainerConfig_imageId_fkey";

-- DropForeignKey
ALTER TABLE "InstanceContainerConfig" DROP CONSTRAINT "InstanceContainerConfig_instanceId_fkey";

-- DropForeignKey
ALTER TABLE "InstanceContainerConfig" DROP CONSTRAINT "InstanceContainerConfig_storageId_fkey";

-- DropIndex
DROP INDEX "ContainerConfig_imageId_key";

-- ContainerConfig and Image
-- reverse ContainerConfig -> Image relation
ALTER TABLE "Image" ADD COLUMN     "configId" UUID;

UPDATE "Image"
SET "configId" = "cc"."id"
FROM (SELECT DISTINCT "id", "imageId" FROM "ContainerConfig") AS "cc"
WHERE "cc"."imageId" = "Image"."id";

-- add ContainerConfigType
ALTER TABLE "ContainerConfig"
ADD COLUMN     "type" "ContainerConfigType";

UPDATE "ContainerConfig"
SET "type" = 'image'::"ContainerConfigType";

ALTER TABLE "ContainerConfig"
ALTER COLUMN     "type" SET NOT NULL;

-- add audit fields
ALTER TABLE "ContainerConfig"
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedBy" TEXT;

UPDATE "ContainerConfig"
SET "updatedAt" = "i"."updatedAt",
    "updatedBy" = "i"."updatedBy"
FROM (SELECT "id", "updatedAt", "updatedBy" FROM "Image") AS "i"
WHERE "i"."id" = "ContainerConfig"."imageId";

ALTER TABLE "ContainerConfig"
ALTER COLUMN     "updatedAt" SET NOT NULL;

-- drop imageId
ALTER TABLE "ContainerConfig" DROP COLUMN "imageId";

-- drop not nulls and defaults
ALTER TABLE "ContainerConfig"
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "expose" DROP NOT NULL,
ALTER COLUMN "user" DROP NOT NULL,
ALTER COLUMN "user" DROP DEFAULT,
ALTER COLUMN "restartPolicy" DROP NOT NULL,
ALTER COLUMN "networkMode" DROP NOT NULL,
ALTER COLUMN "deploymentStrategy" DROP NOT NULL,
ALTER COLUMN "proxyHeaders" DROP NOT NULL,
ALTER COLUMN "tty" DROP NOT NULL,
ALTER COLUMN "useLoadBalancer" DROP NOT NULL;


-- ConfigBundle
ALTER TABLE "ConfigBundle"
ADD COLUMN     "configId" UUID;

UPDATE "ConfigBundle"
SET "configId" = gen_random_uuid()
WHERE "data" IS NOT NULL;

INSERT INTO "ContainerConfig"
("id", "type", "updatedAt", "updatedBy", "environment")
SELECT "configId", 'configBundle'::"ContainerConfigType", "updatedAt", "updatedBy", "data"
FROM "ConfigBundle"
WHERE "data" IS NOT NULL;

ALTER TABLE "ConfigBundle"
DROP COLUMN "data";


-- Deployment
ALTER TABLE "Deployment"
ADD COLUMN     "configId" UUID;

UPDATE "Deployment"
SET "configId" = gen_random_uuid()
WHERE "environment" IS NOT NULL;

INSERT INTO "ContainerConfig"
("id", "type", "updatedAt", "updatedBy", "environment")
SELECT "configId", 'deployment'::"ContainerConfigType", "updatedAt", "updatedBy", "environment"
FROM "Deployment"
WHERE "environment" IS NOT NULL;


ALTER TABLE "Deployment"
DROP COLUMN "environment";


-- Instance
ALTER TABLE "Instance"
ADD COLUMN     "configId" UUID;

UPDATE "Instance"
SET "configId" = "i"."id"
FROM (SELECT DISTINCT "id", "instanceId" FROM "InstanceContainerConfig") AS "i"
WHERE "i"."instanceId" = "Instance"."id";


-- fix instance  config
UPDATE "InstanceContainerConfig" SET "name" = null WHERE "name" = 'null';
UPDATE "InstanceContainerConfig" SET "environment" = null WHERE "environment" = 'null';
UPDATE "InstanceContainerConfig" SET "secrets" = null WHERE "secrets" = 'null';
UPDATE "InstanceContainerConfig" SET "capabilities" = null WHERE "capabilities" = 'null';
UPDATE "InstanceContainerConfig" SET "configContainer" = null WHERE "configContainer" = 'null';
UPDATE "InstanceContainerConfig" SET "ports" = null WHERE "ports" = 'null';
UPDATE "InstanceContainerConfig" SET "portRanges" = null WHERE "portRanges" = 'null';
UPDATE "InstanceContainerConfig" SET "volumes" = null WHERE "volumes" = 'null';
UPDATE "InstanceContainerConfig" SET "commands" = null WHERE "commands" = 'null';
UPDATE "InstanceContainerConfig" SET "args" = null WHERE "args" = 'null';
UPDATE "InstanceContainerConfig" SET "initContainers" = null WHERE "initContainers" = 'null';
UPDATE "InstanceContainerConfig" SET "logConfig" = null WHERE "logConfig" = 'null';
UPDATE "InstanceContainerConfig" SET "networks" = null WHERE "networks" = 'null';
UPDATE "InstanceContainerConfig" SET "dockerLabels" = null WHERE "dockerLabels" = 'null';
UPDATE "InstanceContainerConfig" SET "healthCheckConfig" = null WHERE "healthCheckConfig" = 'null';
UPDATE "InstanceContainerConfig" SET "resourceConfig" = null WHERE "resourceConfig" = 'null';
UPDATE "InstanceContainerConfig" SET "extraLBAnnotations" = null WHERE "extraLBAnnotations" = 'null';
UPDATE "InstanceContainerConfig" SET "customHeaders" = null WHERE "customHeaders" = 'null';
UPDATE "InstanceContainerConfig" SET "annotations" = null WHERE "annotations" = 'null';
UPDATE "InstanceContainerConfig" SET "labels" = null WHERE "labels" = 'null';
UPDATE "InstanceContainerConfig" SET "storageConfig" = null WHERE "storageConfig" = 'null';
UPDATE "InstanceContainerConfig" SET "routing" = null WHERE "routing" = 'null';
UPDATE "InstanceContainerConfig" SET "metrics" = null WHERE "metrics" = 'null';
UPDATE "InstanceContainerConfig" SET "workingDirectory" = null WHERE "workingDirectory" = 'null';
UPDATE "InstanceContainerConfig" SET "expectedState" = null WHERE "expectedState" = 'null';


INSERT INTO "ContainerConfig" (
  "id", "updatedAt", "updatedBy", "type",
  -- common
  "name", "environment", "secrets", "capabilities", "expose", "routing", "configContainer", "user",
  "workingDirectory", "tty", "ports", "portRanges", "volumes", "commands", "args", "initContainers",
  "storageId", "storageSet", "storageConfig", "expectedState",
  -- dagent
  "logConfig", "restartPolicy", "networkMode", "networks", "dockerLabels",
  -- crane
  "deploymentStrategy", "healthCheckConfig", "resourceConfig", "proxyHeaders", "useLoadBalancer",
  "extraLBAnnotations", "customHeaders", "annotations", "labels", "metrics"
)
SELECT
  "InstanceContainerConfig"."id", "i"."updatedAt", "d"."updatedBy", 'instance'::"ContainerConfigType",
  -- common
  "name", "environment", "secrets", "capabilities", "expose", "routing", "configContainer", "user",
  "workingDirectory", "tty", "ports", "portRanges", "volumes", "commands", "args", "initContainers",
  "storageId", "storageSet", "storageConfig", "expectedState",
  -- dagent
  "logConfig", "restartPolicy", "networkMode", "networks", "dockerLabels",
  -- crane
  "deploymentStrategy", "healthCheckConfig", "resourceConfig", "proxyHeaders", "useLoadBalancer",
  "extraLBAnnotations", "customHeaders", "annotations", "labels", "metrics"
FROM "InstanceContainerConfig"
INNER JOIN "Instance" AS "i" ON "i"."id" = "InstanceContainerConfig"."instanceId"
INNER JOIN "Deployment" AS "d" ON "d"."id" = "i"."deploymentId";

ALTER TABLE "Instance"
DROP COLUMN "updatedAt";

DROP TABLE "InstanceContainerConfig";

-- CreateIndex
CREATE UNIQUE INDEX "ConfigBundle_configId_key" ON "ConfigBundle"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_configId_key" ON "Deployment"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_configId_key" ON "Image"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "Instance_configId_key" ON "Instance"("configId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigBundle" ADD CONSTRAINT "ConfigBundle_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
