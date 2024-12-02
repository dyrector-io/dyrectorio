-- Create temp table
SELECT "versionId", MIN("order") "order" INTO "_prisma_migrations_NormalizeOrder" FROM "Image" GROUP BY "versionId";

-- Normalize orders
UPDATE "Image" "img" SET "order" = "order" - (
	SELECT "order" FROM "_prisma_migrations_NormalizeOrder" "norm"
    WHERE "norm"."versionId" = "img"."versionId"
);

-- Drop temp table
DROP TABLE "_prisma_migrations_NormalizeOrder";
