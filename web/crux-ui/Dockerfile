FROM node:17.1.0-alpine

ARG TIME_ZONE

# Add build dependencies and set timezone
RUN apk --update add --no-cache --virtual .build-deps tzdata # && \
RUN cp /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime # && \
RUN echo "${TIME_ZONE}" > /etc/timezone # && \
RUN apk del --no-network .build-deps

# Create Directory for the Container
WORKDIR /usr/app

COPY package*.json ./
COPY .next .next
COPY public public

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN mkdir -p ./.next/cache/images && \
   chown -R node:node ./.next/cache/images && \
   npm ci

USER node

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "prod"]