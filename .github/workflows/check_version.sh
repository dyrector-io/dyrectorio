#!/bin/sh

version=$1
path=$2

if [ "${path: -5}" = .json ]; then
  # json
  package_version=$(cat $path | grep -Eo '"version": "[[:digit:]]+\.[[:digit:]+\.[[:digit:]]+"')
  expected_version="\"version\": \"$version\""
elif [ "${path: -3}" = .go ]; then
  # go
  package_version=$(cat $path | grep -Eo 'Version[[:blank:]]+= "[[:digit:]]+\.[[:digit:]+\.[[:digit:]]+"')
  expected_version="Version = \"$version\""
else
  echo Invalid file $path
  exit 1
fi

# get rid of unnecessary spaces
package_version=$(echo $package_version)

if [ "$expected_version" != "$package_version" ]; then
  echo Invalid "$package_version", expected "$expected_version" in $path
  exit 1
fi

exit 0
