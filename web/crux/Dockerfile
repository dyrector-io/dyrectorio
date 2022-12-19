# Stage 1
FROM node:19.2-alpine3.16 AS BUILDER

ENV NODE_ENV production
WORKDIR /app

COPY ./package.json ./package-lock.json ./tsconfig.build.json ./tsconfig.json ./
COPY ./prisma ./prisma
COPY ./templates ./templates
COPY ./src ./src

RUN npm ci --no-fund && npm run prismagen
RUN npm run build

# Stage 2
FROM node:19.2-alpine3.16 AS RUNNER
ENV NODE_ENV production
ENV TZ Europe/Budapest

RUN apk --update add tzdata openssl

WORKDIR /app

COPY --from=BUILDER /app/dist ./dist
COPY --from=BUILDER /app/package.json ./
COPY --from=BUILDER /app/node_modules ./node_modules
COPY --from=BUILDER /app/prisma ./prisma
COPY --from=BUILDER /app/templates ./templates
COPY ./crux-docker-entrypoint.sh ./install-docker.sh.hbr ./install-k8s.sh.hbr ./
COPY ./proto ./proto

USER node

# Start
ENTRYPOINT ["./crux-docker-entrypoint.sh"]
CMD ["serve"]
