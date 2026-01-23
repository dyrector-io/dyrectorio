-- delete dangling container configs

delete from "ContainerConfig"
where "id" in (
    select cc."id" from "ContainerConfig" as "cc"
    left join "Image" as i on i."configId" = cc."id"
    left join "Instance" as ins on ins."configId" = cc."id"
    left join "Deployment" as d on d."configId" = cc."id"
    left join "ConfigBundle" as cb on cb."configId" = cc.id
    where i."id" is null
    and ins."id" is null
    and d."id" is null
    and cb."id" is null
);

-- define trigger function
CREATE OR REPLACE FUNCTION trigger_delete_container_config()
RETURNS trigger AS $$
BEGIN
  DELETE FROM "ContainerConfig" WHERE id = OLD."configId";
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- create triggers
CREATE TRIGGER image_delete_container_config
AFTER DELETE ON "Image"
FOR EACH ROW
EXECUTE FUNCTION trigger_delete_container_config();

CREATE TRIGGER instance_delete_container_config
AFTER DELETE ON "Instance"
FOR EACH ROW
EXECUTE FUNCTION trigger_delete_container_config();

CREATE TRIGGER config_bundle_delete_container_config
AFTER DELETE ON "ConfigBundle"
FOR EACH ROW
EXECUTE FUNCTION trigger_delete_container_config();

CREATE TRIGGER deployment_delete_container_config
AFTER DELETE ON "Deployment"
FOR EACH ROW
EXECUTE FUNCTION trigger_delete_container_config();
