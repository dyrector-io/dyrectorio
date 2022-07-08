#!/bin/sh

github_ref_type=$1
github_ref_name=$2

if [ $github_ref_type == "branch" ]; then
  case $github_ref_name in
    "main") echo "::set-output name=tag::stable"
    ;;
    "develop") echo "::set-output name=tag::latest"
    ;;
    *)  echo "::set-output name=tag::${{ github.sha }}"
    ;;
  esac
fi
