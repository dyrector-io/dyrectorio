-- DropForeignKey
ALTER TABLE "Instance" DROP CONSTRAINT "Instance_deploymentId_fkey";

-- DropForeignKey
ALTER TABLE "InstanceContainerConfig" DROP CONSTRAINT "InstanceContainerConfig_instanceId_fkey";

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanceContainerConfig" ADD CONSTRAINT "InstanceContainerConfig_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
