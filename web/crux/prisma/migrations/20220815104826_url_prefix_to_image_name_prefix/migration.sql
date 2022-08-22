-- Copy data
DROP TABLE IF EXISTS public._migration_registry;
SELECT 
	id,
  "Registry"."urlPrefix"
INTO public._migration_registry
FROM public."Registry";

-- AlterTable
ALTER TABLE "Registry" DROP COLUMN "urlPrefix",
ADD COLUMN "imageNamePrefix" TEXT;

-- Update values
UPDATE "Registry" SET "imageNamePrefix" = "_migration_registry"."urlPrefix"
FROM "_migration_registry" WHERE "_migration_registry".id = "Registry".id;

-- Drop temp table
DROP TABLE IF EXISTS public._migration_registry;
