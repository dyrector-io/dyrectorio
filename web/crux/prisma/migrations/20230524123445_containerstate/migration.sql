-- AlterEnum
BEGIN;

SELECT id, "updatedAt", "deploymentId", "imageId", "state" INTO _prisma_migrations_Instance FROM public."Instance";
DELETE FROM "Instance";

CREATE TYPE "ContainerStateEnum_new" AS ENUM ('running', 'waiting', 'exited');
ALTER TABLE "Instance" ALTER COLUMN "state" TYPE "ContainerStateEnum_new" USING ("state"::text::"ContainerStateEnum_new");
ALTER TYPE "ContainerStateEnum" RENAME TO "ContainerStateEnum_old";
ALTER TYPE "ContainerStateEnum_new" RENAME TO "ContainerStateEnum";

INSERT INTO "Instance"
(
  select id, "updatedAt",
  (
    case 
      when state = 'running' then 'running'::"ContainerStateEnum"
      when state = 'created' then 'waiting'::"ContainerStateEnum"
      when state = 'restarting' then 'waiting'::"ContainerStateEnum"
      when state = 'removing' then 'waiting'::"ContainerStateEnum"
      when state = 'paused' then 'waiting'::"ContainerStateEnum"
      when state = 'exited' then 'exited'::"ContainerStateEnum"
      when state = 'dead' then 'exited'::"ContainerStateEnum"
      else cast(state as varchar)::"ContainerStateEnum"
    end
  ),
  "deploymentId", "imageId"
  from _prisma_migrations_Instance
);

-- AlterTable
ALTER TABLE "Instance" ADD COLUMN "reason" TEXT;

-- Cleanup
DROP TABLE _prisma_migrations_Instance;
DROP TYPE "ContainerStateEnum_old";

COMMIT;