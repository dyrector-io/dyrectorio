#!/bin/sh

github_ref_type=$1
github_ref_name=$2
github_sha=$3

DOCKERIMAGETAG="$github_sha"
VERSION="v0.0.0"

if [ $github_ref_type == "branch" ]; then
  case $github_ref_name in
    "main") DOCKERIMAGETAG="stable"
    ;;
    "develop")  DOCKERIMAGETAG="latest"
    ;;
  esac
fi

if [ $github_ref_type == "tag" ]; then
  DOCKERIMAGETAG=$github_ref_name
  VERSION=$github_ref_name
fi

echo "{tag}={$DOCKERIMAGETAG}" >> $GITHUB_OUTPUT
echo "{version}={$VERSION}" >> $GITHUB_OUTPUT
