FROM ubuntu:kinetic

RUN apt-get update && apt-get install -y docker-compose nodejs npm jq pip curl zstd

RUN pip install yq

RUN mkdir playwright

WORKDIR playwright

COPY package*.json ./

RUN npm i && \
    npx playwright install-deps chromium

WORKDIR /

RUN rm -rf playwright
