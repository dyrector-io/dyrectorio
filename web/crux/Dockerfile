# Stage 1
FROM node:18.7-alpine AS BUILDER

ENV NODE_ENV production
WORKDIR /app

COPY ./package.json ./package-lock.json ./tsconfig.build.json ./tsconfig.json ./
COPY ./prisma ./prisma
COPY ./src ./src

RUN npm ci && npm run prismagen
RUN npm run build

# Stage 2
FROM node:18.7-alpine AS RUNNER
ENV NODE_ENV production
ENV TZ Europe/Budapest

RUN apk --update add tzdata openssl

WORKDIR /app

COPY --from=BUILDER /app/dist ./dist
COPY --from=BUILDER /app/package.json ./
COPY --from=BUILDER /app/node_modules ./node_modules
COPY --from=BUILDER /app/prisma ./prisma
COPY ./crux-docker-entrypoint.sh ./cert-gen.sh ./install-docker.sh.hbr ./install-k8s.sh.hbr ./
COPY ./proto ./proto

RUN mkdir certs && \
    chown node:node certs && \
    chmod +x cert-gen.sh

USER node

# Start
ENTRYPOINT ["./crux-docker-entrypoint.sh"]
CMD ["serve"]