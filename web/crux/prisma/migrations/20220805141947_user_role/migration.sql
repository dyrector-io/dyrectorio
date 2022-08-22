/*
  Warnings:

  - You are about to drop the column `owner` on the `UsersOnTeams` table. All the data in the column will be lost.
  - Added the required column `role` to the `UsersOnTeams` table without a default value. This is not possible if the table is not empty.

*/

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('owner', 'admin', 'user');

drop table if exists public._migration_teamowners;

-- save data to temp table
select * 
into public._migration_teamowners
from "UsersOnTeams" uot;

delete from public."UsersOnTeams";

-- AlterTable
ALTER TABLE "UsersOnTeams" DROP COLUMN "owner",
ADD COLUMN     "role" "UserRoleEnum" NOT NULL;

-- insert back the saved data with the correct roles
insert into public."UsersOnTeams"
select 
	mto."userId", 
	mto.active, 
	mto."teamId", 
	(case when mto."owner" = true
		then 'owner' 
		else 'user' end)::"UserRoleEnum" as "role"
from public._migration_teamowners mto;

-- drop the temp table
drop table if exists public._migration_teamowners;