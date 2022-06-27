/*
  Warnings:

  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team__product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team__registry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `version` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductTypeEnum" AS ENUM ('simple', 'complex');

-- CreateEnum
CREATE TYPE "VersionTypeEnum" AS ENUM ('incremental', 'rolling');

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_registryId_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_versionId_fkey";

-- DropForeignKey
ALTER TABLE "team__product" DROP CONSTRAINT "team__product_productId_fkey";

-- DropForeignKey
ALTER TABLE "team__product" DROP CONSTRAINT "team__product_teamId_fkey";

-- DropForeignKey
ALTER TABLE "team__registry" DROP CONSTRAINT "team__registry_registryId_fkey";

-- DropForeignKey
ALTER TABLE "team__registry" DROP CONSTRAINT "team__registry_teamId_fkey";

-- DropForeignKey
ALTER TABLE "version" DROP CONSTRAINT "version_productId_fkey";

-- DropTable
DROP TABLE "image";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "registry";

-- DropTable
DROP TABLE "team";

-- DropTable
DROP TABLE "team__product";

-- DropTable
DROP TABLE "team__registry";

-- DropTable
DROP TABLE "version";

-- DropEnum
DROP TYPE "product_type_enum";

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team__Registry" (
    "teamId" UUID NOT NULL,
    "registryId" UUID NOT NULL,

    CONSTRAINT "Team__Registry_pkey" PRIMARY KEY ("teamId","registryId")
);

-- CreateTable
CREATE TABLE "Team__Product" (
    "teamId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "Team__Product_pkey" PRIMARY KEY ("teamId","productId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProductTypeEnum" NOT NULL DEFAULT E'simple',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "changelog" TEXT,
    "type" "VersionTypeEnum" NOT NULL DEFAULT E'incremental',
    "productId" UUID NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" UUID NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageTag" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageConfig" JSONB NOT NULL,
    "versionId" UUID,
    "registryId" UUID NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registry" (
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

    CONSTRAINT "Registry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Team__Registry_registryId_idx" ON "Team__Registry"("registryId");

-- CreateIndex
CREATE INDEX "Team__Registry_teamId_idx" ON "Team__Registry"("teamId");

-- CreateIndex
CREATE INDEX "Team__Product_productId_idx" ON "Team__Product"("productId");

-- CreateIndex
CREATE INDEX "Team__Product_teamId_idx" ON "Team__Product"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Version_name_key" ON "Version"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Image_versionId_key" ON "Image"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_registryId_key" ON "Image"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "Registry_name_key" ON "Registry"("name");

-- AddForeignKey
ALTER TABLE "Team__Registry" ADD CONSTRAINT "Team__Registry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team__Registry" ADD CONSTRAINT "Team__Registry_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team__Product" ADD CONSTRAINT "Team__Product_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team__Product" ADD CONSTRAINT "Team__Product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
