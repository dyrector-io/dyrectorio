FROM docker.io/oryd/kratos:v0.11.0

USER root

RUN apk add gettext

COPY . /usr/bin/app/kratos

RUN mkdir -p /etc/config/kratos && chmod a+x /usr/bin/app/kratos/entrypoint.sh && \
    chown -R 10000:10000 /etc/config/kratos && \
    chmod -R 700 /etc/config/kratos

USER 10000

LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/web/kratos"

ENTRYPOINT ["/usr/bin/app/kratos/entrypoint.sh"]
CMD ["serve", "-c", "/etc/config/kratos/kratos.yaml", "--watch-courier"]

