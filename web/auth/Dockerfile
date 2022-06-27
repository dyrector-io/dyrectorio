FROM node:17.1.0-alpine

ARG TIME_ZONE
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Add build dependencies and set timezone
RUN apk --update add --no-cache --virtual .build-deps tzdata \
   && cp /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime \
   && echo "${TIME_ZONE}" > /etc/timezone \
   && apk del --no-network .build-deps

# Create Directory for the Container
WORKDIR /usr/app

COPY package*.json ./
COPY node_modules node_modules
COPY .next .next
COPY public public
COPY next.config.js next.config.js
COPY i18n.json i18n.json
COPY .next/server/pages pages

RUN mkdir -p ./.next/cache/images && \
   chown -R node:node ./.next/cache/images

USER node

ENTRYPOINT [ "npm", "run", "prod"]