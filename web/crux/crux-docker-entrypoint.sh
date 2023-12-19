#!/bin/sh

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
        echo "serve     Start Crux services"
        exit 1
esac
