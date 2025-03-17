#!/bin/bash
set -eu

# Wait for PostgreSQL to start
until pg_isready -U "root"; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Create the database and users dynamically
echo "Creating databases and users..."

psql -v ON_ERROR_STOP=1 --username root <<-EOSQL
  CREATE USER crux_user WITH ENCRYPTED PASSWORD '${CRUX_POSTGRES_PASSWORD}';
  CREATE DATABASE crux;
  GRANT ALL PRIVILEGES ON DATABASE crux TO crux_user;
  ALTER DATABASE crux OWNER TO crux_user;

  CREATE USER kratos_user WITH ENCRYPTED PASSWORD '${KRATOS_POSTGRES_PASSWORD}';
  CREATE DATABASE kratos;
  GRANT ALL PRIVILEGES ON DATABASE kratos TO kratos_user;
  ALTER DATABASE kratos OWNER TO kratos_user;
EOSQL

echo "Databases and users created successfully."
