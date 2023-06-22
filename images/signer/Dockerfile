FROM docker.io/library/alpine:3.18

SHELL ["/bin/ash","-c"]
WORKDIR /usr/work
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/tree/develop/images/signer"

RUN apk add docker zstd jq cosign crane

