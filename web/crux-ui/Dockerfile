# stage 1, build app
FROM docker.io/library/node:19.2-alpine AS BUILDER
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY ./package.json ./package-lock.json ./
RUN npm ci --no-fund

COPY . .
RUN npm run build

# stage 2, run the app
FROM docker.io/library/node:19.2-alpine AS RUNNER
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV TZ UTC
RUN apk --update add tzdata

COPY --from=BUILDER --chown=node:node /app/public ./public
COPY --from=BUILDER /app/package.json ./package.json
COPY --from=BUILDER --chown=node:node /app/.next ./.next
COPY --from=BUILDER /app/node_modules ./node_modules

USER node

EXPOSE 3000
ENV PORT 3000
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/web/crux-ui"

ENTRYPOINT [ "npm", "run", "prod"]
