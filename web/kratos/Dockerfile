FROM oryd/kratos:v0.10.1

USER root

RUN apk add gettext

COPY . /usr/bin/app/kratos

RUN mkdir -p /etc/config/kratos && chmod a+x /usr/bin/app/kratos/entrypoint.sh && \
    chown -R 10000:10000 /etc/config/kratos && \
    chmod -R 700 /etc/config/kratos

USER 10000

ENTRYPOINT ["/usr/bin/app/kratos/entrypoint.sh"]
CMD ["serve", "-c", "/etc/config/kratos/kratos.yaml", "--watch-courier"]
