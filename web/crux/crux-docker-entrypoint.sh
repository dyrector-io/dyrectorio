#!/bin/sh
export NODE_ENV=production

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
        echo "serve     Start GRPC services"
        exit 1
esac
