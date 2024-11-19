FROM ubuntu:noble

RUN apt-get update && apt-get install -y docker-compose nodejs npm jq curl zstd

RUN mkdir playwright

WORKDIR playwright

COPY package*.json ./

RUN npm i && \
    npx playwright install-deps chromium

WORKDIR /

RUN rm -rf playwright

LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/playwright"

