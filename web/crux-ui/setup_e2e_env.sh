#!/bin/sh

cd ..
cp crux-ui/.env.ci .env
cp crux-ui/.env.ci crux/.env
cp crux-ui/.env.ci crux-ui/.env

cp docker-compose.dev.yaml docker-compose.ci.yaml
yq -i -y '.volumes."traefik-config" = null' docker-compose.ci.yaml
yq -i -y '.services."crux-traefik".volumes[0] = "traefik-config:/etc/traefik"' docker-compose.ci.yaml

docker-compose -f docker-compose.ci.yaml build
docker-compose -f docker-compose.ci.yaml up -d
docker cp traefik.dev.yml crux-traefik:/etc/traefik/traefik.dev.yml
docker-compose -f docker-compose.ci.yaml restart

chmod 777 /root/.cache
