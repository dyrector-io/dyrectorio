# stage 1, dep install
FROM node:17.1.0-alpine AS DEPS
WORKDIR /app

RUN apk add --no-cache libc6-compat nasm autoconf automake bash libltdl libtool gcc make g++ zlib-dev
COPY package.json package-lock.json ./
RUN npm ci

# stage 2, build app
FROM node:17.1.0-alpine AS BUILDER
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=DEPS /app/node_modules ./node_modules
COPY . .
RUN npm run build

# stage 3, run the app
FROM node:17.1.0-alpine AS RUNNER
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV TZ Europe/Budapest
RUN apk --update add tzdata

COPY --from=BUILDER --chown=node:node /app/public ./public
COPY --from=BUILDER /app/package.json ./package.json
COPY --from=BUILDER --chown=node:node /app/.next ./.next
COPY --from=BUILDER /app/node_modules ./node_modules

USER node

EXPOSE 3000
ENV PORT 3000

ENTRYPOINT [ "npm", "run", "prod"]