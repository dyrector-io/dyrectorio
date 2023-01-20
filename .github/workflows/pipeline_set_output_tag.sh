#!/bin/sh

set -eu

github_ref_type=$1
github_ref_name=$2
github_sha=$3
github_base_ref=${4:-}

DOCKERIMAGETAG="$github_sha"
VERSION="v0.0.0"

if [ $github_ref_type = "branch" ]; then
  case $github_ref_name in
    "main") DOCKERIMAGETAG="stable"
    ;;
    "develop") DOCKERIMAGETAG="latest"
    ;;
  esac

  if [ $github_base_ref != "" ]; then
    DOCKERIMAGETAG="latest"
  fi

  if [ $github_base_ref = "main" ]; then
    DOCKERIMAGETAG="stable"
  fi
fi

if [ $github_ref_type = "tag" ]; then
  DOCKERIMAGETAG=$github_ref_name
  VERSION=$github_ref_name
fi

echo "tag=$DOCKERIMAGETAG" >> $GITHUB_OUTPUT
echo "version=$VERSION" >> $GITHUB_OUTPUT
