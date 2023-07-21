BEGIN;

UPDATE "ContainerConfig"
SET "networkMode" = 'bridge'::"NetworkMode"
where "networkMode" IN ('overlay','ipvlan','macvlan');

UPDATE "InstanceContainerConfig"
SET "networkMode" = 'bridge'::"NetworkMode"
where "networkMode" IN ('overlay','ipvlan','macvlan');

CREATE TYPE "NetworkMode_new" AS ENUM ('none', 'host', 'bridge');
ALTER TABLE "ContainerConfig" ALTER COLUMN "networkMode" TYPE "NetworkMode_new" USING ("networkMode"::text::"NetworkMode_new");
ALTER TABLE "InstanceContainerConfig" ALTER COLUMN "networkMode" TYPE "NetworkMode_new" USING ("networkMode"::text::"NetworkMode_new");
ALTER TYPE "NetworkMode" RENAME TO "NetworkMode_old";
ALTER TYPE "NetworkMode_new" RENAME TO "NetworkMode";
DROP TYPE "NetworkMode_old";
COMMIT;
