#!/usr/bin/env sh
set -eu

rm -rf /etc/config/kratos/*

cp /usr/bin/app/kratos/identity.schema.json /etc/config/kratos
cp -r /usr/bin/app/kratos/hooks /etc/config/kratos/hooks
cp -r /usr/bin/app/kratos/templates /etc/config/kratos/templates/
envsubst '${KRATOS_URL}, ${AUTH_URL}, ${AUTH_API_KEY}' < /usr/bin/app/kratos/kratos.template.yaml > /etc/config/kratos/kratos.yaml

exec kratos $@