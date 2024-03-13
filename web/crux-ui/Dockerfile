# stage 1, build app
FROM docker.io/library/node:20-alpine3.17 AS BUILDER
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

COPY ./package.json ./package-lock.json ./.npm ./
RUN npm ci --arch=x64 --platform=linuxmusl --cache .npm --prefer-offline --no-fund

COPY . .
RUN npm run build

# stage 2, run the app
FROM docker.io/library/node:20-alpine3.17 AS RUNNER
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV TZ UTC
RUN apk --update add tzdata && \
    mkdir .next && \
    chown node:node .next

COPY --from=BUILDER --chown=node:node /app/.next/standalone ./
COPY --from=BUILDER --chown=node:node /app/public ./public
COPY --from=BUILDER --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/web/crux-ui"

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -nv -t1 --spider http://localhost:3000/ || exit 1

CMD [ "server.js" ]
