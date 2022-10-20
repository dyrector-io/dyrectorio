FROM docker.io/library/golang:1.18-alpine

ARG CO_BIN_NAME

ENV CO_BIN_NAME=$CO_BIN_NAME

COPY ./scripts/pre-update.sh /
COPY ./scripts/post-update.sh /

LABEL com.centurylinklabs.watchtower.lifecycle.pre-update="/pre-update.sh"
LABEL com.centurylinklabs.watchtower.lifecycle.post-update="/post-update.sh"

RUN  apk add -U --no-cache ca-certificates curl

RUN mkdir -p /etc/dyrectorio
COPY ./out/$CO_BIN_NAME /usr/bin/

ENTRYPOINT "$CO_BIN_NAME"