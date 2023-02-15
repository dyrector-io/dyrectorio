BEGIN;

SELECT id, "createdAt", "createdBy", "updatedAt", "updatedBy", note, prefix, status, environment, "versionId", "nodeId"
into _prisma_migrations_Deployment
FROM public."Deployment";

delete from "Deployment";

CREATE TYPE "DeploymentStatusEnum_new" AS ENUM ('preparing', 'inProgress', 'successful', 'failed', 'obsolete', 'downgraded');
ALTER TABLE "Deployment" ALTER COLUMN "status" TYPE "DeploymentStatusEnum_new" USING ("status"::text::"DeploymentStatusEnum_new");
ALTER TYPE "DeploymentStatusEnum" RENAME TO "DeploymentStatusEnum_old";
ALTER TYPE "DeploymentStatusEnum_new" RENAME TO "DeploymentStatusEnum";

insert into "Deployment"
(
	select id, "createdAt", "createdBy", "updatedAt", "updatedBy", note, prefix, 
	(
		case when status = 'obsolate' 
			then 'obsolete'::"DeploymentStatusEnum" 
		else 
			cast(status as varchar)::"DeploymentStatusEnum" 
		end
	), 
	environment, 
	"versionId", "nodeId" from _prisma_migrations_Deployment
);

select * from "Deployment";

drop table _prisma_migrations_Deployment;
DROP TYPE "DeploymentStatusEnum_old";

COMMIT;