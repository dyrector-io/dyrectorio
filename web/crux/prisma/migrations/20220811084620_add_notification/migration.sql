-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('discord', 'slack', 'teams');

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "NotificationTypeEnum" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_name_teamId_key" ON "Notification"("name", "teamId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
