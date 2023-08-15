select "id", "createdBy" from "Node"
into "_prisma_migrations_NodeIds"
where "token" is not null

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
CREATE UNIQUE INDEX "NodeToken_nodeId_key" ON "NodeToken"("nodeId"); -- todo set 00000000-0000-0000-0000-000000000000 for legacy tokens

-- AddForeignKey
ALTER TABLE "NodeToken" ADD CONSTRAINT "NodeToken_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

insert into "NodeToken"
select "id" as "nodeId", "createdBy", '00000000-0000-0000-0000-000000000000' as "nonce"
from  "_prisma_migrations_NodeIds"

drop table "_prisma_migrations_NodeIds"