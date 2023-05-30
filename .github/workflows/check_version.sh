#!/bin/sh

version=$1
path=$2

if [ "$(echo "$path" | rev | cut -c -5 | rev)" = .json ]; then
  # json
  package_version=$(grep -Eo '"version": "[[:digit:]]+\.[[:digit:]+\.[[:digit:]]+"' "$path")
  expected_version="\"version\": \"$version\""
elif [ "$(echo "$path" | rev | cut -c -3 | rev)" = .go ]; then
  # go
  package_version=$(grep -Eo 'Version[[:blank:]]+= "[[:digit:]]+\.[[:digit:]+\.[[:digit:]]+"' "$path")
  expected_version="Version = \"$version\""
else
  echo Invalid file "$path"
  exit 1
fi

if [ "$expected_version" != "$package_version" ]; then
  echo Invalid "$package_version", expected "$expected_version" in "$path"
  exit 1
fi

exit 0
