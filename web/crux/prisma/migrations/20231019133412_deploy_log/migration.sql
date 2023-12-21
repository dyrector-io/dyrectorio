-- AlterEnum
BEGIN;

CREATE TYPE "NotificationEventTypeEnum_new" AS ENUM ('deploymentStatus', 'versionCreated', 'nodeAdded', 'userInvited', 'imagePushed', 'imagePulled');
ALTER TABLE "NotificationEvent" ALTER COLUMN "event" TYPE "NotificationEventTypeEnum_new" USING (
	case "event"
		when 'deploymentCreated' then 'deploymentStatus'::"NotificationEventTypeEnum_new"
		else "event"::text::"NotificationEventTypeEnum_new"
	end
);
ALTER TYPE "NotificationEventTypeEnum" RENAME TO "NotificationEventTypeEnum_old";
ALTER TYPE "NotificationEventTypeEnum_new" RENAME TO "NotificationEventTypeEnum";
DROP TYPE "NotificationEventTypeEnum_old";

COMMIT;
