-- CreateEnum
CREATE TYPE "NodeTypeEnum" AS ENUM ('docker', 'k8s');

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "type" "NodeTypeEnum" DEFAULT E'docker';
