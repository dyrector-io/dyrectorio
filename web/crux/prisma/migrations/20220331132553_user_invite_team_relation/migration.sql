-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
