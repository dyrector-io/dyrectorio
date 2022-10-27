/*
  Warnings:

  - You are about to drop the column `config` on the `ContainerConfig` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `InstanceContainerConfig` table. All the data in the column will be lost.
  - Added the required column `name` to the `InstanceContainerConfig` table without a default value. This is not possible if the table is not empty.
  - Made the column `capabilities` on table `InstanceContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `environment` on table `InstanceContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secrets` on table `InstanceContainerConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NetworkMode" AS ENUM ('none', 'host', 'bridge');

-- CreateEnum
CREATE TYPE "DeploymentStrategy" AS ENUM ('recreate', 'rolling');

-- CreateEnum
CREATE TYPE "RestartPolicy" AS ENUM ('always', 'unless_stopped', 'no', 'on_failure');

-- CreateEnum
CREATE TYPE "ExposeStrategy" AS ENUM ('none', 'expose', 'expose_with_tls');

-- AlterTable
ALTER TABLE "ContainerConfig" DROP COLUMN "config",
ADD COLUMN     "args" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "commands" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "configContainer" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "customHeaders" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "deploymentStrategy" "DeploymentStrategy",
ADD COLUMN     "expose" "ExposeStrategy",
ADD COLUMN     "extraLBAnnotations" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "healthCheckConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "importContainer" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "ingress" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "initContainers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "logConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "networkMode" "NetworkMode",
ADD COLUMN     "networks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "portRanges" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "ports" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "proxyHeaders" BOOLEAN,
ADD COLUMN     "resourceConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "restartPolicy" "RestartPolicy",
ADD COLUMN     "tty" BOOLEAN,
ADD COLUMN     "useLoadBalancer" BOOLEAN,
ADD COLUMN     "user" INTEGER,
ADD COLUMN     "volumes" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "InstanceContainerConfig" DROP COLUMN "config",
ADD COLUMN     "args" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "commands" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "configContainer" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "customHeaders" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "deploymentStrategy" "DeploymentStrategy",
ADD COLUMN     "expose" "ExposeStrategy",
ADD COLUMN     "extraLBAnnotations" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "healthCheckConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "importContainer" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "ingress" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "initContainers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "logConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "networkMode" "NetworkMode",
ADD COLUMN     "networks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "portRanges" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "ports" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "proxyHeaders" BOOLEAN,
ADD COLUMN     "resourceConfig" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "restartPolicy" "RestartPolicy",
ADD COLUMN     "tty" BOOLEAN,
ADD COLUMN     "useLoadBalancer" BOOLEAN,
ADD COLUMN     "user" INTEGER,
ADD COLUMN     "volumes" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "capabilities" SET NOT NULL,
ALTER COLUMN "capabilities" SET DEFAULT '[]',
ALTER COLUMN "environment" SET NOT NULL,
ALTER COLUMN "environment" SET DEFAULT '[]',
ALTER COLUMN "secrets" SET NOT NULL,
ALTER COLUMN "secrets" SET DEFAULT '[]';
