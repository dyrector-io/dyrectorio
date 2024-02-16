#!/bin/sh

case $1 in
    "serve")
        exec npm run start:prod
    ;;
    "migrate")
        exec npx prisma migrate deploy
    ;;
    "encrypt-generate")
        exec npm run encrypt:generate
    ;;
    "encrypt-rotate")
        exec npm run encrypt:rotate
    ;;
    *)
        echo "Invalid argument: $1"
        echo "Usage:"
        echo "migrate           Run migrations"
        echo "serve             Start Crux services"
        echo "encrypt-generate  Generate encryption key"
        echo "encrypt-rotate    Rotate encryption keys"
        exit 1
esac
