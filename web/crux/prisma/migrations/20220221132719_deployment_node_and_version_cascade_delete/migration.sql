-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_versionId_fkey";

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
