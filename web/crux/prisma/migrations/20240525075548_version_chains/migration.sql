    -- AlterTable
ALTER TABLE "VersionsOnParentVersion" ADD COLUMN     "chainId" UUID;

-- Set chain ids
WITH RECURSIVE parents(parentVersionId, versionId) AS (
    SELECT "parentVersionId", "versionId"
    FROM "VersionsOnParentVersion"
    UNION ALL
    SELECT vopv."parentVersionId", p."versionid"
    FROM "VersionsOnParentVersion" vopv
    join parents p on p."parentversionid" = vopv."versionId"
  )
  update "VersionsOnParentVersion" vopvUpd
  set "chainId" = p.parentversionid
  FROM parents p
  left join "VersionsOnParentVersion" vopv on vopv."versionId" = p."parentversionid"
  WHERE vopvUpd."versionId" = p."versionid" and vopv."versionId" is null;

 -- AlterTable
ALTER TABLE "VersionsOnParentVersion" ALTER COLUMN "chainId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "VersionsOnParentVersion" ADD CONSTRAINT "VersionsOnParentVersion_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "VersionsOnParentVersion_chainId_versionId_key" ON "VersionsOnParentVersion"("chainId", "versionId");
