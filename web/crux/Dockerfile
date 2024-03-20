# Stage 1
FROM docker.io/library/node:20-alpine3.17 AS BUILDER

WORKDIR /app

RUN apk --update add openssl1.1-compat

COPY ./package.json ./package-lock.json ./.npm ./tsconfig.build.json ./tsconfig.json ./
RUN npm ci --arch=x64 --platform=linuxmusl --cache .npm --prefer-offline --no-fund

COPY ./prisma ./prisma
RUN npm run prisma:gen

COPY ./src ./src

RUN npm run build && \
    npm prune --production

# Stage 2
FROM docker.io/library/node:20-alpine3.17 AS RUNNER

ENV NODE_ENV production
ENV TZ UTC

RUN apk --update add tzdata openssl1.1-compat

WORKDIR /app

COPY --from=BUILDER /app/dist ./dist
COPY --from=BUILDER /app/package.json ./
COPY --from=BUILDER /app/node_modules ./node_modules
COPY --from=BUILDER /app/prisma ./prisma
COPY ./crux-docker-entrypoint.sh ./
COPY ./assets/ ./assets/
COPY ./proto ./proto

USER node

EXPOSE 5000
EXPOSE 1848

LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/web/crux"

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -nv -t1 --spider http://localhost:1848/api/health || exit 1

# Start
ENTRYPOINT ["./crux-docker-entrypoint.sh"]
CMD ["serve"]
