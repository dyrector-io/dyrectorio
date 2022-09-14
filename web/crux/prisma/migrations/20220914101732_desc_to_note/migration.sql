-- Copy data
DROP TABLE IF EXISTS public._migration_deployment;
SELECT
  id, "description"
INTO public._migration_deployment
FROM public."Deployment";

-- AlterTable
ALTER TABLE "Deployment" DROP COLUMN "description",
ADD COLUMN     "note" TEXT;

-- Update values
UPDATE "Deployment" SET "note" = "_migration_deployment"."description"
FROM "_migration_deployment" WHERE "_migration_deployment".id = "Deployment".id;