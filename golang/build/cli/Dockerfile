# this image is meant to build with buildx
 FROM alpine:3.16

ARG TARGETARCH
ARG TARGETOS
ARG REVISION

LABEL org.opencontainers.image.title="CLI component of dyrector.io"
LABEL org.opencontainers.image.vendor="dyrector.io"
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/cli/dyo"
LABEL org.opencontainers.image.revision="$REVISION"
LABEL org.opencontainers.image.documentation="https://docs.dyrector.io"


COPY ./out/dyo-$TARGETOS-$TARGETARCH /usr/bin/dyo

ENTRYPOINT ["dyo"]
CMD ["help"]
