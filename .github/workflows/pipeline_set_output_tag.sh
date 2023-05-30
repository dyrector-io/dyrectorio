#!/bin/sh

set -eu

github_ref_type=$1
github_ref_name=$2
github_sha=$3
github_base_ref=${4:-""}

DOCKERIMAGETAG="$github_sha"
# These values are wrong on purpose: if we see these default values in the wild,
# we will know something happened that shouldn't have
VERSION="v0.0.0"
MINORVERSION="v0.0.0"

if [ $github_ref_type = "branch" ]; then
  case $github_ref_name in
    "main") DOCKERIMAGETAG="stable"
    ;;
    "develop") DOCKERIMAGETAG="latest"
    ;;
  esac

  if [ $github_base_ref != "" ]; then
    DOCKERIMAGETAG="latest"
  elif [ $github_base_ref = "main" ]; then
    DOCKERIMAGETAG="stable"
  fi
fi

if [ $github_ref_type = "tag" ]; then
  DOCKERIMAGETAG=$github_ref_name
  VERSION=$github_ref_name
  MINORVERSION=$(echo $github_ref_name| cut -d. -f1-2)
fi

echo "tag=$DOCKERIMAGETAG" >> $GITHUB_OUTPUT
echo "version=$VERSION" >> $GITHUB_OUTPUT
echo "minorversion=$MINORVERSION" >> $GITHUB_OUTPUT
