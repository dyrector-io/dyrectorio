-- CreateEnum
CREATE TYPE "AgentEventTypeEnum" AS ENUM ('connected', 'left', 'kicked', 'update');

-- CreateTable
CREATE TABLE "AgentEvent" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" "AgentEventTypeEnum" NOT NULL,
    "data" JSONB,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentEvent" ADD CONSTRAINT "AgentEvent_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
