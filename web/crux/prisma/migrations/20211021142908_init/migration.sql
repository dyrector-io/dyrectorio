-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('simple', 'complex');

-- CreateTable
CREATE TABLE "team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team__registry" (
    "teamId" UUID NOT NULL,
    "registryId" UUID NOT NULL,

    CONSTRAINT "team__registry_pkey" PRIMARY KEY ("teamId","registryId")
);

-- CreateTable
CREATE TABLE "team__product" (
    "teamId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "team__product_pkey" PRIMARY KEY ("teamId","productId")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "product_type_enum" NOT NULL DEFAULT E'simple',

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "incremental" BOOLEAN NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" UUID NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageTag" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageConfig" JSONB NOT NULL,
    "versionId" UUID,
    "registryId" UUID NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerConfig" (
    "id" UUID NOT NULL,

    CONSTRAINT "ContainerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "keyFilePath" TEXT NOT NULL,
    "certFilePath" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registry" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "user" TEXT,
    "token" TEXT,

    CONSTRAINT "registry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team__registry_registryId_idx" ON "team__registry"("registryId");

-- CreateIndex
CREATE INDEX "team__registry_teamId_idx" ON "team__registry"("teamId");

-- CreateIndex
CREATE INDEX "team__product_productId_idx" ON "team__product"("productId");

-- CreateIndex
CREATE INDEX "team__product_teamId_idx" ON "team__product"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "product_name_key" ON "product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "version_name_key" ON "version"("name");

-- CreateIndex
CREATE UNIQUE INDEX "image_versionId_key" ON "image"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "image_registryId_key" ON "image"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "Node_name_key" ON "Node"("name");

-- CreateIndex
CREATE UNIQUE INDEX "registry_name_key" ON "registry"("name");

-- AddForeignKey
ALTER TABLE "team__registry" ADD CONSTRAINT "team__registry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team__registry" ADD CONSTRAINT "team__registry_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team__product" ADD CONSTRAINT "team__product_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team__product" ADD CONSTRAINT "team__product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
