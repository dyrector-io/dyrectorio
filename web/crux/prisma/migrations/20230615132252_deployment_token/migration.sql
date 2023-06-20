-- CreateTable
CREATE TABLE "DeploymentToken" (
    "id" UUID NOT NULL,
    "deploymentId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6),
    "nonce" UUID NOT NULL,

    CONSTRAINT "DeploymentToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentToken_deploymentId_key" ON "DeploymentToken"("deploymentId");

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentToken_deploymentId_nonce_key" ON "DeploymentToken"("deploymentId", "nonce");

-- AddForeignKey
ALTER TABLE "DeploymentToken" ADD CONSTRAINT "DeploymentToken_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
