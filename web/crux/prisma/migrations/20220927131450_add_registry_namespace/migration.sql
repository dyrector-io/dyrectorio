-- CreateEnum
CREATE TYPE "RegistryNamespaceEnum" AS ENUM ('organization', 'user', 'group', 'project');

-- AlterTable
ALTER TABLE "Registry" ADD COLUMN     "namespace" "RegistryNamespaceEnum";

-- Update values
UPDATE "Registry"
	SET "namespace" = CASE 
        WHEN "Registry".TYPE = 'github' THEN 'organization'::"RegistryNamespaceEnum"
        WHEN "Registry".TYPE = 'gitlab' THEN 'group'::"RegistryNamespaceEnum"
		ELSE NULL
		END;
