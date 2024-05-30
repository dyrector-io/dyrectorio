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
    "versionId" UUID NOT NULL,
    "packageId" UUID NOT NULL,

    CONSTRAINT "VersionChainsOnPackage_pkey" PRIMARY KEY ("versionId","packageId")
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
CREATE UNIQUE INDEX "VersionChainsOnPackage_versionId_packageId_key" ON "VersionChainsOnPackage"("versionId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageEnvironment_name_packageId_key" ON "PackageEnvironment"("name", "packageId");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChainsOnPackage" ADD CONSTRAINT "VersionChainsOnPackage_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionChainsOnPackage" ADD CONSTRAINT "VersionChainsOnPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnvironment" ADD CONSTRAINT "PackageEnvironment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEnvironment" ADD CONSTRAINT "PackageEnvironment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
