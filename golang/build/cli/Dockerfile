FROM alpine:3.16

COPY ./out/dyo-amd64 /usr/bin/dyo

LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/cli/dyo"

ENTRYPOINT ["dyo"]
CMD ["help"]

