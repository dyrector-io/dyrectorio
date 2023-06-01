-- CreateEnum
CREATE TYPE "AgentEventTypeEnum" AS ENUM ('connected', 'left', 'kicked', 'update');

-- CreateTable
CREATE TABLE "AgentEvents" (
    "id" UUID NOT NULL,
    "nodeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" "AgentEventTypeEnum" NOT NULL,
    "data" JSONB,

    CONSTRAINT "AgentEvents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentEvents" ADD CONSTRAINT "AgentEvents_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
