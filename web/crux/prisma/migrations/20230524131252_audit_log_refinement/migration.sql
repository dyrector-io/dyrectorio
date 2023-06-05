-- CreateEnum
CREATE TYPE "AuditLogContextEnum" AS ENUM ('http', 'ws', 'rpc');

-- CreateEnum
CREATE TYPE "AuditLogRequestMethodEnum" AS ENUM ('get', 'post', 'put', 'patch', 'delete');

-- Create temp table
SELECT al."id", al."createdAt" , al."userId" , al."teamId" , 
	'' as "context",
	case
	  when strpos(al."serviceCall", ' ') - 1 < 0 then 'rpc'
	  else lower(substr(al."serviceCall", 1, strpos(al."serviceCall", ' ') - 1))
	end as "method",
	case
	  when strpos(al."serviceCall", ' ') - 1 < 0 then al."serviceCall"
	  else substr(al."serviceCall", strpos(al."serviceCall", ' ') + 1)
	end as "event",
	al."data" 
into _prisma_migrations_auditLog
FROM "AuditLog" al;

-- remove unnecessary ws logs
delete from _prisma_migrations_auditLog as al
where al."method" = 'ws'
and (
	al."event" like '%/unsubbed'
	or al."event" like '%/subbed' 
	or al."event" like '%/watch-containers-state'
	or al."event" like '%/watch-container-log'
	or al."event" like '%/fetch-deployment-events'
	or al."event" like '%/get-instance'
	or al."event" like '%/get-instance-secrets'
	or al."event" like '%/focus-input'
	or al."event" like '%/blur-input'
	or al."event" like '%/find-image'
	or al."event" like '%/fetch-image-tags'
	or al."event" like '%/get-image'
);

-- remove unnecessary http get logs
delete from _prisma_migrations_auditLog as al
where al."method" = 'get';

delete from "AuditLog"; 

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "serviceCall",
ADD COLUMN     "context" "AuditLogContextEnum" NOT NULL,
ADD COLUMN     "event" TEXT NOT NULL,
ADD COLUMN     "method" "AuditLogRequestMethodEnum";

-- inster auditlog
insert into "AuditLog"("id", "createdAt", "userId", "teamId", "context", "method", "event", "data")
select
	pma."id",
	pma."createdAt",
	pma."userId",
	pma."teamId",
	(
		select ( case 
			when al."method" = 'ws' then 'ws'
			when al."method" in ('get', 'post', 'put', 'patch', 'delete') then 'http'
			else 'rpc' end
		)::"AuditLogContextEnum" as "context"
		from "_prisma_migrations_auditlog" al 
		where al.id = pma.id
	),
	(case
		when pma."method" in ('get', 'post', 'put', 'patch', 'delete') then pma."method"
		else null end
	)::"AuditLogRequestMethodEnum" as "method",
	substr(pma."event", strpos(pma."event", ' ') + 1) as "event",
	pma."data"
from "_prisma_migrations_auditlog" pma;

drop table _prisma_migrations_auditLog;
