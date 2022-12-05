/*
  Warnings:

  - Made the column `deploymentStrategy` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expose` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `networkMode` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `proxyHeaders` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restartPolicy` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tty` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `useLoadBalancer` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ALTER COLUMN "deploymentStrategy" SET NOT NULL,
ALTER COLUMN "expose" SET NOT NULL,
ALTER COLUMN "networkMode" SET NOT NULL,
ALTER COLUMN "proxyHeaders" SET NOT NULL,
ALTER COLUMN "restartPolicy" SET NOT NULL,
ALTER COLUMN "tty" SET NOT NULL,
ALTER COLUMN "useLoadBalancer" SET NOT NULL;

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "name" DROP NOT NULL;
