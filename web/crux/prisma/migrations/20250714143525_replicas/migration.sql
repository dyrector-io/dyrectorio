-- DropForeignKey
ALTER TABLE "ConfigBundle" DROP CONSTRAINT "ConfigBundle_configId_fkey";

-- DropForeignKey
ALTER TABLE "Deployment" DROP CONSTRAINT "Deployment_configId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_configId_fkey";

-- DropForeignKey
ALTER TABLE "Instance" DROP CONSTRAINT "Instance_configId_fkey";

-- AlterTable
ALTER TABLE "ContainerConfig" ADD COLUMN     "replicas" INTEGER;

update "ContainerConfig" as dstCC
	set "healthCheckConfig" = case when srcCC."healthCheckConfig" is null or srcCC."healthCheckConfig" = 'null' then null else json_build_object(
		'startup', case when srcCC."healthCheckConfig"->'startupProbe' is null or srcCC."healthCheckConfig"->>'startupProbe' = '' then 'null' else json_build_object(
			'path', srcCC."healthCheckConfig"->'startupProbe',
			'type', 'http',
			'port', (srcCC."healthCheckConfig"->>'port')::int
		) end,
		'liveness', case when srcCC."healthCheckConfig"->'livenessProbe' is null or srcCC."healthCheckConfig"->>'livenessProbe' = '' then 'null' else json_build_object(
			'path', srcCC."healthCheckConfig"->'livenessProbe',
			'type', 'http',
			'port', (srcCC."healthCheckConfig"->>'port')::int
		) end,
		'readiness', case when srcCC."healthCheckConfig"->'readinessProbe' is null or srcCC."healthCheckConfig"->>'readinessProbe' = '' then 'null' else json_build_object(
			'path', srcCC."healthCheckConfig"->'readinessProbe',
			'type', 'http',
			'port', (srcCC."healthCheckConfig"->>'port')::int
		) end
	) end
FROM "ContainerConfig" AS srcCC
WHERE dstCC.id = srcCC.id;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigBundle" ADD CONSTRAINT "ConfigBundle_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ContainerConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
