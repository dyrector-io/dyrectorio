#!/bin/sh 

CERT_PREFIX="$1"
DOMAIN="$2"

# domain is obligatory
if [ -z "$DOMAIN" ]; then
  echo "Usage: $(basename $0) <prefix> <domain> <alternative-domains or IPs...>"
  echo "alternative domain format DNS:example.com or IP:1.2.3.4"
  echo "Example: $(basename $0) api localhost IP:127.0.0.1"
  exit 11
fi

# no cert directory -> no fun
cd ./certs || exit 1
rm $CERT_PREFIX-*.key $CERT_PREFIX-*.crt

# dyrector.io basic informations
SUBJ=$(echo -n "
C=HU
ST=Csongrad
L=Szeged
CN=$DOMAIN
emailAddress=hello@dyrector.io
" | tr "\n" "/")

# variable containing SAN tags
# DNS: or IP: is valid, the first tag is a domain
SANS=""

shift
for ARG in "${@}"; do
    SAN="$ARG"
    SANS="$SANS $SAN"
done

# the separator is a comma in the SAN list
SANS=$(echo $SANS | sed 's/\ /,\ /g')


echo "SANS: $SANS"
echo "SUBJ: $SUBJ"
echo "PRFX: $CERT_PREFIX"

openssl genrsa -out $CERT_PREFIX-private.key 4096
openssl req -new -x509 -sha256 -days 1825 -key $CERT_PREFIX-private.key -out $CERT_PREFIX-public.crt -subj "$SUBJ" -addext "subjectAltName = $SANS"

cd ../