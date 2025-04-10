FROM docker.io/postgres:17.4-alpine

COPY init-database.sh /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=root
ENV CRUX_POSTGRES=crux
ENV CRUX_POSTGRES_USER=crux_user
ENV KRATOS_POSTGRES=kratos
ENV KRATOS_POSTGRES_USER=kratos_user

RUN chmod +x /docker-entrypoint-initdb.d/init-database.sh
