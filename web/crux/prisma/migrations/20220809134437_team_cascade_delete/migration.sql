-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_teamId_fkey";

-- DropForeignKey
ALTER TABLE "DeploymentEvent" DROP CONSTRAINT "DeploymentEvent_deploymentId_fkey";

-- AddForeignKey
ALTER TABLE "DeploymentEvent" ADD CONSTRAINT "DeploymentEvent_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
