FROM docker.io/library/node:20-alpine3.17

SHELL ["/bin/ash","-c"]
WORKDIR /usr/work
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/tree/develop/distrib/images/builder-nodejs"

RUN apk add alpine-sdk docker zstd openssl1.1-compat jq

