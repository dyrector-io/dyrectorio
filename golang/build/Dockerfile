FROM busybox:uclibc as busybox

FROM gcr.io/distroless/static


LABEL company=dyrector.io
LABEL maintainer=nandor-magyar

COPY --from=busybox /bin/sh  /bin/sh
COPY --from=busybox /bin/arch  /bin/arch
COPY --from=busybox /bin/echo  /bin/echo

ARG AGENT_BINARY=dagent

COPY ./scripts/start-agent.sh /

COPY ./out/$AGENT_BINARY-amd64 /agent-amd64
COPY ./out/$AGENT_BINARY-arm64 /agent-arm64


ENTRYPOINT ["/start-agent.sh"]
