-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "connectedAt" TIMESTAMPTZ(6),
ADD COLUMN     "disconnectedAt" TIMESTAMPTZ(6);
