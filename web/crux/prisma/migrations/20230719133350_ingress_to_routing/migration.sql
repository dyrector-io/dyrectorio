-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN "routing" JSONB;
UPDATE "ContainerConfig"
  SET routing = CASE
		WHEN ingress->>'uploadLimit' IS NULL
      THEN json_build_object('domain', CONCAT_WS('.', ingress->>'domain', ingress->>'host'))
		ELSE json_build_object('domain', CONCAT_WS('.', ingress->>'domain', ingress->>'host'), 'uploadLimit', ingress->>'uploadLimit')
	END;
ALTER TABLE "ContainerConfig" DROP COLUMN "ingress";

-- AlterTable
ALTER TABLE "InstanceContainerConfig" ADD COLUMN "routing" JSONB;
UPDATE "InstanceContainerConfig"
  SET routing = CASE
		WHEN ingress->>'uploadLimit' IS NULL
      THEN json_build_object('domain', CONCAT_WS('.', ingress->>'domain', ingress->>'host'))
		ELSE json_build_object('domain', CONCAT_WS('.', ingress->>'domain', ingress->>'host'), 'uploadLimit', ingress->>'uploadLimit')
	END;
ALTER TABLE "InstanceContainerConfig" DROP COLUMN "ingress";
