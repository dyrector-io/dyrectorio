-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "chainId" UUID;

-- CreateTable
CREATE TABLE "VersionChain" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "VersionChain_pkey" PRIMARY KEY ("id")
);

-- insert chains
insert into "VersionChain"
select v."id", p."id" as "projectId" from "Version" v
inner join "Project" p on p."id" = v."projectId"
left join "VersionsOnParentVersion" vopv on vopv."versionId" = v."id"
where v."type" = 'incremental' and vopv."versionId" is null;

-- set incremental chainIds
update "Version"
set "chainId" = uv."id"
from (
	select v."id"
	from "Version" v
	left join "VersionsOnParentVersion" vopv on vopv."versionId" = v."id"
	where v."type" = 'incremental' and vopv."versionId" is null
) as uv
where "Version"."id" = uv."id";

-- set children chainIds
WITH RECURSIVE parents(parentVersionId, versionId) AS (
    SELECT "parentVersionId", "versionId"
    FROM "VersionsOnParentVersion"
    UNION ALL
    SELECT vopv."parentVersionId", p."versionid"
    FROM "VersionsOnParentVersion" vopv
    join parents p on p."parentversionid" = vopv."versionId"
  )
  update "Version" v
  set "chainId" = p."parentversionid"
  FROM parents p
  left join "VersionsOnParentVersion" parentVersionParent on parentVersionParent."versionId" = p."parentversionid"
  WHERE v."id" = p."versionid" and parentVersionParent."versionId" is null;


-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" UUID,
    "name" VARCHAR(70) NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionChainsOnPackage" (
    "chainId" UUID NOT NULL,
    "packageId" UUID NOT NULL,

    CONSTRAINT "VersionChainsOnPackage_pkey" PRIMARY KEY ("chainId","packageId")
);

-- CreateTable
CREATE TABLE "PackageEnvironment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "packageId" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "prefix" TEXT NOT NULL,

    CONSTRAINT "PackageEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_teamId_key" ON "Package"("name", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "VersionChainsOnPackage_chainId_packageId_key" ON "VersionChainsOnPackage"("chainId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageEnvironment_name_packageId_key" ON "PackageEnvironment"("name", "packageId");

-- AddForeignKey
ALTER TABLE "VersionChain" ADD CONSTRAINT "VersionChain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "VersionChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChainsOnPackage" ADD CONSTRAINT "VersionChainsOnPackage_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "VersionChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChainsOnPackage" ADD CONSTRAINT "VersionChainsOnPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnvironment" ADD CONSTRAINT "PackageEnvironment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnvironment" ADD CONSTRAINT "PackageEnvironment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
