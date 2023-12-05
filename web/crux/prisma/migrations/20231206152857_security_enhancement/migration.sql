-- AlterTable
ALTER TABLE "Registry" DROP COLUMN "token",
ADD COLUMN     "token" BYTEA;

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "accessKey",
ADD COLUMN     "accessKey" BYTEA,
DROP COLUMN "secretKey",
ADD COLUMN     "secretKey" BYTEA;
