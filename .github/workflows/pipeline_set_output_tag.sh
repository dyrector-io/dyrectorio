#!/bin/sh

if [ $GITHUB_REF_TYPE == "branch" ]; then
  case ${{ github.ref_name }} in
    "main") echo "::set-output name=tag::stable"
    ;;
    "develop") echo "::set-output name=tag::latest"
    ;;
    *)  echo "::set-output name=tag::${{ github.sha }}"
    ;;
  esac
fi
