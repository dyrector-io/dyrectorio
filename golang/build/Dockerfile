
# this image is meant to build with buildx
FROM gcr.io/distroless/static

ARG TARGETOS
ARG TARGETARCH
ARG AGENT_BINARY
ARG REVISION

LABEL org.opencontainers.image.title="Agent component for dyrector.io"
LABEL org.opencontainers.image.vendor="dyrector.io"
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/agent/$AGENT_BINARY"
LABEL org.opencontainers.image.revision="$REVISION"
LABEL org.opencontainers.image.documentation="https://docs.dyrector.io"

COPY ./out/$AGENT_BINARY-$TARGETOS-$TARGETARCH /agent

HEALTHCHECK --interval=30s --timeout=5s CMD ["/agent", "health"]

ENTRYPOINT ["/agent"]
