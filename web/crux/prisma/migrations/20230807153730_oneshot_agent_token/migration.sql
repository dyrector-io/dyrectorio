select "id", "createdBy"
into "_prisma_migrations_NodeIds"
from "Node"
where "token" is not null;

-- AlterEnum
ALTER TYPE "AgentEventTypeEnum" ADD VALUE 'installed';

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "token";

-- CreateTable
CREATE TABLE "NodeToken" (
    "nodeId" UUID NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "NodeToken_pkey" PRIMARY KEY ("nodeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NodeToken_nodeId_key" ON "NodeToken"("nodeId");

-- AddForeignKey
ALTER TABLE "NodeToken" ADD CONSTRAINT "NodeToken_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

insert into "NodeToken"
select "id" as "nodeId", '00000000-0000-0000-0000-000000000000' as "nonce", "createdBy"
from  "_prisma_migrations_NodeIds";

drop table "_prisma_migrations_NodeIds";


-- agent event to node event

CREATE TYPE "NodeEventTypeEnum" AS ENUM ('installed', 'connected', 'left', 'kicked', 'update', 'updateCompleted', 'tokenReplaced', 'containerCommand');

select "id", "nodeId", "createdAt", "event"::varchar::"NodeEventTypeEnum", "data"
into "_prisma_migrations_AgentEvent"
from "AgentEvent";

-- DropForeignKey
ALTER TABLE "AgentEvent" DROP CONSTRAINT "AgentEvent_nodeId_fkey";

-- DropTable
DROP TABLE "AgentEvent";

-- DropEnum
DROP TYPE "AgentEventTypeEnum";

-- CreateTable
CREATE TABLE "NodeEvent" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" "NodeEventTypeEnum" NOT NULL,
    "data" JSONB,

    CONSTRAINT "NodeEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeEvent" ADD CONSTRAINT "NodeEvent_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

insert into "NodeEvent"
select * from "_prisma_migrations_AgentEvent";

drop table "_prisma_migrations_AgentEvent";