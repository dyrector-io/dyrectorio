-- AlterTable
ALTER TABLE "ContainerConfig" ALTER COLUMN "user" SET DEFAULT -1;

UPDATE "ContainerConfig"
SET "user" = -1
WHERE "user" IS NULL;

ALTER TABLE "ContainerConfig" ALTER COLUMN "user" SET NOT NULL;

