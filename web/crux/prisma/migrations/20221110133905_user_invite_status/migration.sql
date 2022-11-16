-- CreateEnum
CREATE TYPE "UserInvitationStatusEnum" AS ENUM ('pending', 'expired', 'declined');

-- AlterTable
ALTER TABLE "UserInvitation" ADD COLUMN     "status" "UserInvitationStatusEnum" NOT NULL DEFAULT 'pending';
