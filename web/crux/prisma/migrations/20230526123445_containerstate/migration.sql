BEGIN;

-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "state";

-- DropType
DROP TYPE "ContainerStateEnum";

COMMIT;
