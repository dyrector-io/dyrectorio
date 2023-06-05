BEGIN;
CREATE TYPE "ProjectTypeEnum_new" AS ENUM ('versionless', 'versioned');
ALTER TABLE "Project" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "type" TYPE "ProjectTypeEnum_new" USING (case "type" when 'simple' then 'versionless'::"ProjectTypeEnum_new" else 'versioned'::"ProjectTypeEnum_new" end);
ALTER TYPE "ProjectTypeEnum" RENAME TO "ProjectTypeEnum_old";
ALTER TYPE "ProjectTypeEnum_new" RENAME TO "ProjectTypeEnum";
DROP TYPE "ProjectTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "type" DROP DEFAULT;