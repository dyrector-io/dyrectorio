#!/bin/sh

export NODE_ENV=production

/app/cert-gen.sh || exit 1

case $1 in
    "serve")
        exec npm run start:prod
    ;;
    "migrate")
        exec npx prisma migrate deploy
    ;;
    *)
        echo "Invalid argument: $1"
        echo "Usage:"
        echo "migrate   Run migrations"
        echo "serve     Start GRCP services"
        exit 1
esac
