-- Save existing credentials
SELECT "id", "token" INTO "_prisma_migrations_Registry" FROM "Registry" WHERE "token" IS NOT NULL;
SELECT "id", "accessKey", "secretKey" INTO "_prisma_migrations_Storage" FROM "Storage" WHERE "accessKey" IS NOT NULL OR "secretKey" IS NOT NULL;

-- AlterTable
ALTER TABLE "Registry" DROP COLUMN "token",
ADD COLUMN     "token" BYTEA;

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "accessKey",
ADD COLUMN     "accessKey" BYTEA,
DROP COLUMN "secretKey",
ADD COLUMN     "secretKey" BYTEA;
