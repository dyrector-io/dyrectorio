#!/usr/bin/env sh
set -eu

rm -rf /etc/config/kratos/*

cp /usr/bin/app/kratos/identity.schema.json /etc/config/kratos
cp -r /usr/bin/app/kratos/templates /etc/config/kratos/templates/

OIDC_GITLABHUB_SCHEMA_MAPPER=$(base64 -w 0 /usr/bin/app/kratos/oidc/gitlabhub.schema.jsonnet)
export OIDC_GITLABHUB_SCHEMA_MAPPER

OIDC_GOOGLE_SCHEMA_MAPPER=$(base64 -w 0 /usr/bin/app/kratos/oidc/google.schema.jsonnet)
export OIDC_GOOGLE_SCHEMA_MAPPER

OIDC_AZURE_SCHEMA_MAPPER=$(base64 -w 0 /usr/bin/app/kratos/oidc/azure.schema.jsonnet)
export OIDC_AZURE_SCHEMA_MAPPER

source "/usr/bin/app/kratos/oidc-setup.sh" || exit 1

envsubst '${KRATOS_URL}, ${KRATOS_ADMIN_URL}, ${CRUX_UI_URL}, ${FROM_EMAIL}, ${FROM_NAME}, ${OIDC_GITLABHUB_SCHEMA_MAPPER}, ${OIDC_GOOGLE_SCHEMA_MAPPER}, ${OIDC_AZURE_SCHEMA_MAPPER}' < /usr/bin/app/kratos/kratos.template.yaml > /etc/config/kratos/kratos.yaml

exec kratos $@
