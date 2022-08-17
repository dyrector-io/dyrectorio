#!/bin/sh

CERT_DIR="/app/certs"

generate_cert() {
    CERT_PREFIX=$1

    # generate certificate
    echo "Obtaining new certificates..."
    openssl req -newkey rsa:4096 -nodes -x509 -sha256 -days 1825 -keyout $CERT_DIR/$CERT_PREFIX-private.key -out $CERT_DIR/$CERT_PREFIX-public.crt -subj "/C=HU/ST=Csongrad/L=Szeged/CN=selfsigned.dyrector.io/emailAddress=hello@dyrector.io/"
}

expiry_check_cert() {
    CERT_PREFIX=$1

    # check certificate and its expiry, so the user will have an idea about it:
    # if it's less than 30 days we throw a warning,
    # if it's expired we bail
    echo "Checking the expiry of certificates..."
    openssl x509 -noout -enddate -in $CERT_DIR/$CERT_PREFIX-public.crt -checkend "0"
    if [[ $? -ne 0 ]]; then
        echo "ERROR: Certificate is expired."
        exit 1
    fi

    openssl x509 -noout -enddate -in $CERT_DIR/$CERT_PREFIX-public.crt -checkend "2592000"
    if [[ $? -ne 0 ]]; then
        echo "WARNING: Certificate will expire within the next 30 days."
    fi
}

check_cert() {
    CERT_PREFIX=$1

    # check if the certificates are existing
    test -f $CERT_DIR/$CERT_PREFIX-public.crt && test -f $CERT_DIR/$CERT_PREFIX-private.key
}

for prefix in "api" "agent"; do
    # if certs exists we check on them, otherwise we make self-signed one
    check_cert $prefix && expiry_check_cert $prefix || generate_cert $prefix
done

