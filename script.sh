#!/bin/sh

set -e

if [ $(id -u) -ne 0 ]; then
  echo "Installation process needs root privileges" 1>&2
  sudo -s
fi

# Setup the default root folder for volumes
if [ $(uname -s) = 'Darwin' ]; then
  echo "Detected: Mac OS X"
  ROOT_FOLDER=$HOME'/Library/dyrectorio/srv/dagent'
elif [ $(uname -s) = 'Linux' ]; then
  echo "Detected: Linux"
  ROOT_FOLDER='/srv/dagent'
else
  echo "Not supported OS!"
fi

if [ -z "$(which docker)" ]; then
  echo "Docker is required, make sure it is installed and available in PATH!"
  exit 1
fi

echo "Installing dyrector.io agent (dagent)..."

if [ $(docker ps --no-trunc --filter name=^/dagent$ | tail -n +2 | wc -l) -eq 1 ]; then
  echo "DAgent is is running already, terminating"
  docker stop dagent
fi

if [ $(docker ps -a --no-trunc --filter name=^/dagent$ | tail -n +2 | wc -l) -eq 1 ]; then
  docker rm dagent
else
  echo "DAgent not running, installing..."
fi

mkdir -p $ROOT_FOLDER
docker pull ghcr.io/dyrector-io/dyrectorio/agent/dagent:latest

MSYS_NO_PATHCONV=1

docker run \
  --restart unless-stopped \
  -e GRPC_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjM3NTMyNDEzODQsImlzcyI6IjE3Mi4yMC4wLjE6NTAwMCIsInN1YiI6IjVjNGJmNjlkLWViZWEtNDBhZS04YzIwLTc4OGZjMjc2ZmIyOCJ9.RFQkopx5ZoSDuxXDavRXmoA4NBqpMXBLIsVbU5SsWt4' \
  -e HOSTNAME="$HOSTNAME || $HOST || 'levinexttestv2'" \
  -e DATA_MOUNT_PATH=$ROOT_FOLDER \
  -e UPDATE_METHOD='off' \
  -e UPDATE_POLL_INTERVAL='600s' \
  -e GRPC_INSECURE='true' \
  -e DAGENT_IMAGE='ghcr.io/dyrector-io/dyrectorio/agent/dagent' \
  -e DAGENT_TAG='stable' \
  -e DAGENT_NAME='levinexttestv2' \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --network dyrectorio-stack \
  --name 'dagent' \
  -v $ROOT_FOLDER/:/srv/dagent -d ghcr.io/dyrector-io/dyrectorio/agent/dagent:latest
