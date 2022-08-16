-- CreateEnum
CREATE TYPE "ContainerStateEnum" AS ENUM ('created', 'restarting', 'running', 'removing', 'paused', 'exited', 'dead');

-- Copy data
DROP TABLE IF EXISTS public._migration_instance;
SELECT 
	id, 
	CASE
		WHEN "Instance"."status"='restating'::"ContainerStatusEnum" THEN 'restarting'::"ContainerStateEnum"
		ELSE "Instance"."status"::text::"ContainerStateEnum"
	END
INTO public._migration_instance
FROM public."Instance";

-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "status",
ADD COLUMN     "state" "ContainerStateEnum";

-- Update values
UPDATE "Instance" SET "state" = "_migration_instance"."status"
FROM "_migration_instance" WHERE "_migration_instance".id = "Instance".id;

-- DropEnum
DROP TYPE "ContainerStatusEnum";

-- Drop temp table
DROP TABLE IF EXISTS public._migration_instance;
