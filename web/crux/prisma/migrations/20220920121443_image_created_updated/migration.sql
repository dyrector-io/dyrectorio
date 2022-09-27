-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedBy" UUID;

-- Set createdBy
UPDATE "Image" SET "createdBy" = "Version"."createdBy"
FROM "Version" WHERE "Version".id = "Image"."versionId";

-- AlterTable NOT NULL
ALTER TABLE "Image" ALTER COLUMN "createdBy" SET NOT NULL;
