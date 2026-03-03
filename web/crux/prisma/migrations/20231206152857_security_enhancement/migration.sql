-- Save existing credentials

--create migration tables
DO $$
BEGIN

if exists(
	select * from "Registry"
) then
    CREATE TABLE "_prisma_migrations_Registry" AS SELECT "id", "token" FROM "Registry" WHERE "token" IS NOT NULL;
end if;

if exists(
	select * from "Storage"
) then
    CREATE TABLE "_prisma_migrations_Storage" AS SELECT "id", "accessKey", "secretKey" FROM "Storage" WHERE "accessKey" IS NOT NULL OR "secretKey" IS NOT NULL;
end if;

END
$$;

-- AlterTable
ALTER TABLE "Registry" DROP COLUMN "token",
ADD COLUMN     "token" BYTEA;

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "accessKey",
ADD COLUMN     "accessKey" BYTEA,
DROP COLUMN "secretKey",
ADD COLUMN     "secretKey" BYTEA;
