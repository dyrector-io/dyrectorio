FROM node:17.1-alpine

ARG TIME_ZONE

# Add build dependencies and set timezone
RUN apk --update add --no-cache --virtual .build-deps tzdata \
   && cp /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime \
   && echo "${TIME_ZONE}" > /etc/timezone \
   && apk del --no-network .build-deps \
   && apk add openssl

# Create Directory for the Container
WORKDIR /usr/app

COPY ./crux-docker-entrypoint.sh ./
COPY ./cert-gen.sh ./

COPY ./package*.json ./
RUN npm ci prisma

COPY ./prisma ./prisma
RUN npx prisma generate

COPY ./install-dagent.sh.hbr ./install-dagent.sh.hbr
COPY ./install-crane.sh.hbr ./install-crane.sh.hbr
COPY ./proto ./proto
COPY ./dist ./dist

RUN mkdir certs \
    && chown node:node -R ./node_modules/prisma ./node_modules/.prisma ./certs && chmod 700 -R ./certs
# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Start
ENTRYPOINT ["./crux-docker-entrypoint.sh"]
CMD ["serve"]