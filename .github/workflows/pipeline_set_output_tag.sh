#!/bin/sh

set -eu

github_ref_type=$1
github_ref_name=$2
github_sha=$3
github_base_ref=${4:-""}

IMAGETAG="$github_sha"
EXTRATAG=""
# These values are wrong on purpose: if we see these default values in the wild,
# we will know something happened that shouldn't have
VERSION="v0.0.0"
MINORVERSION="v0.0.0"

if [ "$github_ref_type" = "branch" ]; then
  case $github_ref_name in
    "main") IMAGETAG="stable"
    ;;
    "develop") IMAGETAG="latest"
    ;;
  esac

  if [ "$github_base_ref" = "main" ]; then
    IMAGETAG="stable"
  elif [ "$github_base_ref" != "" ]; then
    IMAGETAG="latest"
  fi
elif [ "$github_ref_type" = "tag" ]; then
  IMAGETAG="$github_ref_name"
  EXTRATAG="stable"
  VERSION=$github_ref_name
  MINORVERSION=$(echo "$github_ref_name"| cut -d. -f1-2)
else
 echo unexpected github_ref_type
 exit 1
fi

echo "tag=$IMAGETAG" >> "$GITHUB_OUTPUT"
echo "extratag=$EXTRATAG" >> "$GITHUB_OUTPUT"
echo "version=$VERSION" >> "$GITHUB_OUTPUT"
echo "minorversion=$MINORVERSION" >> "$GITHUB_OUTPUT"
