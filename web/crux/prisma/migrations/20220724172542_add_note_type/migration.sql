-- CreateEnum
CREATE TYPE "NodeTypeEnum" AS ENUM ('dagent', 'crane');

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "type" "NodeTypeEnum" NOT NULL DEFAULT E'dagent';
