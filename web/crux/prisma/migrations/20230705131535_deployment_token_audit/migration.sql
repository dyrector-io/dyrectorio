-- CreateEnum
CREATE TYPE "AuditLogActorTypeEnum" AS ENUM ('user', 'deploymentToken');

-- AlterTable
ALTER TABLE "AuditLog" 
ADD COLUMN     "actorType" "AuditLogActorTypeEnum",
ADD COLUMN     "deploymentTokenId" UUID,
ALTER COLUMN "userId" DROP NOT NULL;

update "AuditLog"
set "actorType" = 'user'::"AuditLogActorTypeEnum";

alter table "AuditLog"
alter column "actorType" set not null;

-- AlterTable
ALTER TABLE "DeploymentToken" ADD COLUMN     "name" text;

update "DeploymentToken"
set "name" = (select distinct concat(p."name", ' ', n."name", ' ', d.prefix) from "DeploymentToken" dt
inner join "Deployment" d on d.id = dt."deploymentId" 
inner join "Node" n on n.id = d."nodeId"
inner join "Version" v on v.id = d."versionId"
inner join "Project" p on p.id = v."projectId"
where d.id = "deploymentId");

-- AlterTable
ALTER TABLE "DeploymentToken" ALTER COLUMN     "name" set not null;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_deploymentTokenId_fkey" FOREIGN KEY ("deploymentTokenId") REFERENCES "DeploymentToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
