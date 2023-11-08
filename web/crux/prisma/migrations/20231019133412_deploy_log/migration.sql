--Update
UPDATE "DeploymentEvent" 
SET value = json_build_object('log', value, 'level', 'info') 
WHERE type = 'log' AND jsonb_typeof(value) = 'array';
