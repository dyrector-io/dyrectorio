/*
  Warnings:

  - You are about to drop the column `ingress` on the `ContainerConfig` table. All the data in the column will be lost.
  - You are about to drop the column `ingress` on the `InstanceContainerConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN "domain" JSONB;
UPDATE "ContainerConfig"
  SET domain = CASE
		WHEN ingress->>'uploadLimit' IS NULL
      THEN json_build_object('name', CONCAT_WS('.', ingress->>'name', ingress->>'host'))
		ELSE json_build_object('name', CONCAT_WS('.', ingress->>'name', ingress->>'host'), 'uploadLimit', ingress->>'uploadLimit')
	END;
ALTER TABLE "ContainerConfig" DROP COLUMN "ingress";

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN "domain" JSONB;
UPDATE "InstanceContainerConfig"
  SET domain = CASE
		WHEN ingress->>'uploadLimit' IS NULL
      THEN json_build_object('name', CONCAT_WS('.', ingress->>'name', ingress->>'host'))
		ELSE json_build_object('name', CONCAT_WS('.', ingress->>'name', ingress->>'host'), 'uploadLimit', ingress->>'uploadLimit')
	END;
ALTER TABLE "InstanceContainerConfig" DROP COLUMN "ingress";
