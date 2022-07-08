#!/usr/bin/env sh
set -eu

rm -rf /etc/config/kratos/*

cp /usr/bin/app/kratos/identity.schema.json /etc/config/kratos
cp -r /usr/bin/app/kratos/templates /etc/config/kratos/templates/
envsubst '${KRATOS_URL}, ${KRATOS_ADMIN_URL}, ${AUTH_URL}' < /usr/bin/app/kratos/kratos.template.yaml > /etc/config/kratos/kratos.yaml

exec kratos $@