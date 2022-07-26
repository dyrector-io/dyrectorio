/*
  Warnings:

  - Added the required column `name` to the `ContainerConfig` table without a default value. This is not possible if the table is not empty.
  - Made the column `capabilities` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `config` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.
  - Made the column `environment` on table `ContainerConfig` required. This step will fail if there are existing NULL values in that column.

*/

-- save confings into temp table
drop table if exists public._migration_containerconfigdata;

select 
	id, 
	coalesce(capabilities, '[]') as capabilities , 
	coalesce(config, '{"ports": [], "mounts": [], "networkMode": "none"}') as config,
	coalesce(environment, '[]') as environment, 
	"imageId"
into public._migration_containerconfigdata
from public."ContainerConfig";

-- delete configs
delete from public."ContainerConfig";

-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "capabilities" SET NOT NULL,
ALTER COLUMN "config" SET NOT NULL,
ALTER COLUMN "environment" SET NOT NULL;

-- insert back the configs with default image name
insert into public."ContainerConfig"
select cc.id, cc.capabilities, cc.config, cc.environment, "imageId", (SELECT replace(i."name", '/', '-') from "Image" as i where i.id = cc."imageId") as "name" from public._migration_containerconfigdata as cc;

drop table if exists public._migration_containerconfigdata;

