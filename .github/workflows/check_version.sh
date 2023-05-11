#!/bin/sh

version=$1

packageversion=$(cat $2/package.json | grep -Eo '\"version\": \"[[:digit:]]+\.[[:digit:]+\.[[:digit:]]+\"')
formattedversion="\"version\": \"$version\""

if [ "$formattedversion" = "$packageversion" ]; then
  exit 0
else
  exit 1
fi
