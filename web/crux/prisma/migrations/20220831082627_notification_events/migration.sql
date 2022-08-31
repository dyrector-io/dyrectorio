-- CreateEnum
CREATE TYPE "NotificationEventTypeEnum" AS ENUM ('deployment_created', 'version_created', 'node_added', 'user_team_invited');

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" UUID NOT NULL,
    "event" "NotificationEventTypeEnum" NOT NULL,
    "notificationId" UUID NOT NULL,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEvent_event_notificationId_key" ON "NotificationEvent"("event", "notificationId");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
