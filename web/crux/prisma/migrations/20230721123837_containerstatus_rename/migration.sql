BEGIN;

SELECT * INTO _prisma_migrations_DeploymentEvent FROM "DeploymentEvent";

DELETE FROM "DeploymentEvent";

CREATE TYPE "DeploymentEventTypeEnum_new" AS ENUM ('log', 'deploymentStatus', 'containerState');
ALTER TABLE "DeploymentEvent" ALTER COLUMN "type" TYPE "DeploymentEventTypeEnum_new" USING ("type"::text::"DeploymentEventTypeEnum_new");
ALTER TYPE "DeploymentEventTypeEnum" RENAME TO "DeploymentEventTypeEnum_old";
ALTER TYPE "DeploymentEventTypeEnum_new" RENAME TO "DeploymentEventTypeEnum";

INSERT INTO "DeploymentEvent"
(
	SELECT id, "createdAt",
	(
		CASE WHEN type = 'containerStatus'
			then 'containerState'::"DeploymentEventTypeEnum"
		else
			cast(type as varchar)::"DeploymentEventTypeEnum"
		end
	),
	"value", "deploymentId", "tryCount"
  	FROM _prisma_migrations_DeploymentEvent
);

DROP TABLE _prisma_migrations_DeploymentEvent;
DROP TYPE "DeploymentEventTypeEnum_old";

COMMIT;
