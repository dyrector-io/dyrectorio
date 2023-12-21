-- AlterEnum
CREATE TYPE "NotificationEventTypeEnum_new" AS ENUM ('deploymentStatus', 'versionCreated', 'nodeAdded', 'userInvited', 'imagePushed', 'imagePulled');
ALTER TABLE "NotificationEvent" ALTER COLUMN "event" TYPE "NotificationEventTypeEnum_new" USING (
	case "event"
		when 'deploymentCreated'::text::"NotificationEventTypeEnum" then 'deploymentStatus'::text::"NotificationEventTypeEnum_new"
		else "event"::text::"NotificationEventTypeEnum_new"
	end
);
ALTER TYPE "NotificationEventTypeEnum" RENAME TO "NotificationEventTypeEnum_old";
ALTER TYPE "NotificationEventTypeEnum_new" RENAME TO "NotificationEventTypeEnum";
DROP TYPE "NotificationEventTypeEnum_old";

-- CreateTable
CREATE TABLE "RegistryToken" (
    "id" UUID NOT NULL,
    "registryId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6),
    "nonce" UUID NOT NULL,

    CONSTRAINT "RegistryToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistryToken_registryId_key" ON "RegistryToken"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryToken_registryId_nonce_key" ON "RegistryToken"("registryId", "nonce");

-- AddForeignKey
ALTER TABLE "RegistryToken" ADD CONSTRAINT "RegistryToken_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
