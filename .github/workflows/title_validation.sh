#!/bin/sh

filtered=$(echo $1 | grep -E '(feat|fix|chore|build|docs|refactor|techdebt|release|test|BREAKING CHANGE)(\((web|agent|ci|cli|deps|crux|crux-ui|kratos|crane|dagent)\))?: [\w\S]*')

if [ -n "$filtered" ]; then
  echo "Title is valid."
  exit 0
fi

echo "Title is invalid."
exit 123

