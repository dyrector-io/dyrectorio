-- CreateTable
CREATE TABLE "ConfigBundle" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedBy" UUID,
    "teamId" UUID NOT NULL,

    CONSTRAINT "ConfigBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigBundleOnDeployments" (
    "deploymentId" UUID NOT NULL,
    "configBundleId" UUID NOT NULL,

    CONSTRAINT "ConfigBundleOnDeployments_pkey" PRIMARY KEY ("deploymentId","configBundleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigBundle_name_teamId_key" ON "ConfigBundle"("name", "teamId");

-- AddForeignKey
ALTER TABLE "ConfigBundle" ADD CONSTRAINT "ConfigBundle_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigBundleOnDeployments" ADD CONSTRAINT "ConfigBundleOnDeployments_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigBundleOnDeployments" ADD CONSTRAINT "ConfigBundleOnDeployments_configBundleId_fkey" FOREIGN KEY ("configBundleId") REFERENCES "ConfigBundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
