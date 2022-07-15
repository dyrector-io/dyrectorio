#!/bin/sh

export NODE_ENV=production

generate_cert() {
    CERT_PREFIX=$1

    if ! openssl x509 -in "./certs/$CERT_PREFIX-public.crt" -noout -text | grep DNS: | grep -q $CRUX_DOMAIN
    then
        ./cert-gen.sh $CERT_PREFIX $CRUX_DOMAIN $CRUX_DOMAIN_ALTS
    else
        echo "$CERT_PREFIX: Certificate contains the domain"
    fi
}

# ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime
# echo "${TIME_ZONE}" > /etc/timezone

if [ "$1" = serve ]
then
    if [ -n "$CRUX_DOMAIN" ]
    then
        generate_cert api
        generate_cert agent
    fi

    exec npm run start:prod
elif [ "$1" = migrate ]
then
    exec npx prisma migrate deploy
else
    echo "Invalid argument: $1"
    echo "Usage:"
    echo "migrate   Run migrations"
    echo "serve     Start GRCP services"
fi
