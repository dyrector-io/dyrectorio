/*
  Warnings:

  - The values [expose_with_tls] on the enum `ExposeStrategy` will be removed. If these variants are still used in the database, this will fail.
  - The values [unless_stopped,on_failure] on the enum `RestartPolicy` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExposeStrategy_new" AS ENUM ('none', 'expose', 'exposeWithTls');
ALTER TABLE "ContainerConfig" ALTER COLUMN "expose" TYPE "ExposeStrategy_new" USING ("expose"::text::"ExposeStrategy_new");
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "expose" TYPE "ExposeStrategy_new" USING ("expose"::text::"ExposeStrategy_new");
ALTER TYPE "ExposeStrategy" RENAME TO "ExposeStrategy_old";
ALTER TYPE "ExposeStrategy_new" RENAME TO "ExposeStrategy";
DROP TYPE "ExposeStrategy_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RestartPolicy_new" AS ENUM ('always', 'unlessStopped', 'no', 'onFailure');
ALTER TABLE "ContainerConfig" ALTER COLUMN "restartPolicy" TYPE "RestartPolicy_new" USING ("restartPolicy"::text::"RestartPolicy_new");
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "restartPolicy" TYPE "RestartPolicy_new" USING ("restartPolicy"::text::"RestartPolicy_new");
ALTER TYPE "RestartPolicy" RENAME TO "RestartPolicy_old";
ALTER TYPE "RestartPolicy_new" RENAME TO "RestartPolicy";
DROP TYPE "RestartPolicy_old";
COMMIT;

-- AlterTable
ALTER TABLE "ContainerConfig" ALTER COLUMN "capabilities" DROP NOT NULL,
ALTER COLUMN "capabilities" DROP DEFAULT,
ALTER COLUMN "environment" DROP NOT NULL,
ALTER COLUMN "environment" DROP DEFAULT,
ALTER COLUMN "secrets" DROP NOT NULL,
ALTER COLUMN "secrets" DROP DEFAULT,
ALTER COLUMN "args" DROP NOT NULL,
ALTER COLUMN "args" DROP DEFAULT,
ALTER COLUMN "commands" DROP NOT NULL,
ALTER COLUMN "commands" DROP DEFAULT,
ALTER COLUMN "configContainer" DROP NOT NULL,
ALTER COLUMN "configContainer" DROP DEFAULT,
ALTER COLUMN "customHeaders" DROP NOT NULL,
ALTER COLUMN "customHeaders" DROP DEFAULT,
ALTER COLUMN "extraLBAnnotations" DROP NOT NULL,
ALTER COLUMN "extraLBAnnotations" DROP DEFAULT,
ALTER COLUMN "healthCheckConfig" DROP NOT NULL,
ALTER COLUMN "healthCheckConfig" DROP DEFAULT,
ALTER COLUMN "importContainer" DROP NOT NULL,
ALTER COLUMN "importContainer" DROP DEFAULT,
ALTER COLUMN "ingress" DROP NOT NULL,
ALTER COLUMN "ingress" DROP DEFAULT,
ALTER COLUMN "initContainers" DROP NOT NULL,
ALTER COLUMN "initContainers" DROP DEFAULT,
ALTER COLUMN "logConfig" DROP NOT NULL,
ALTER COLUMN "logConfig" DROP DEFAULT,
ALTER COLUMN "networks" DROP NOT NULL,
ALTER COLUMN "networks" DROP DEFAULT,
ALTER COLUMN "portRanges" DROP NOT NULL,
ALTER COLUMN "portRanges" DROP DEFAULT,
ALTER COLUMN "ports" DROP NOT NULL,
ALTER COLUMN "ports" DROP DEFAULT,
ALTER COLUMN "resourceConfig" DROP NOT NULL,
ALTER COLUMN "resourceConfig" DROP DEFAULT,
ALTER COLUMN "volumes" DROP NOT NULL,
ALTER COLUMN "volumes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "capabilities" DROP NOT NULL,
ALTER COLUMN "capabilities" DROP DEFAULT,
ALTER COLUMN "environment" DROP NOT NULL,
ALTER COLUMN "environment" DROP DEFAULT,
ALTER COLUMN "secrets" DROP NOT NULL,
ALTER COLUMN "secrets" DROP DEFAULT,
ALTER COLUMN "args" DROP NOT NULL,
ALTER COLUMN "args" DROP DEFAULT,
ALTER COLUMN "commands" DROP NOT NULL,
ALTER COLUMN "commands" DROP DEFAULT,
ALTER COLUMN "configContainer" DROP NOT NULL,
ALTER COLUMN "configContainer" DROP DEFAULT,
ALTER COLUMN "customHeaders" DROP NOT NULL,
ALTER COLUMN "customHeaders" DROP DEFAULT,
ALTER COLUMN "extraLBAnnotations" DROP NOT NULL,
ALTER COLUMN "extraLBAnnotations" DROP DEFAULT,
ALTER COLUMN "healthCheckConfig" DROP NOT NULL,
ALTER COLUMN "healthCheckConfig" DROP DEFAULT,
ALTER COLUMN "importContainer" DROP NOT NULL,
ALTER COLUMN "importContainer" DROP DEFAULT,
ALTER COLUMN "ingress" DROP NOT NULL,
ALTER COLUMN "ingress" DROP DEFAULT,
ALTER COLUMN "initContainers" DROP NOT NULL,
ALTER COLUMN "initContainers" DROP DEFAULT,
ALTER COLUMN "logConfig" DROP NOT NULL,
ALTER COLUMN "logConfig" DROP DEFAULT,
ALTER COLUMN "networks" DROP NOT NULL,
ALTER COLUMN "networks" DROP DEFAULT,
ALTER COLUMN "portRanges" DROP NOT NULL,
ALTER COLUMN "portRanges" DROP DEFAULT,
ALTER COLUMN "ports" DROP NOT NULL,
ALTER COLUMN "ports" DROP DEFAULT,
ALTER COLUMN "resourceConfig" DROP NOT NULL,
ALTER COLUMN "resourceConfig" DROP DEFAULT,
ALTER COLUMN "volumes" DROP NOT NULL,
ALTER COLUMN "volumes" DROP DEFAULT;
