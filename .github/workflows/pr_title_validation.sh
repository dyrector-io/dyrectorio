#!/bin/sh

COMMIT_TYPES="cicd|chore|doc|feat|fix|hotfix|refactor|test|BREAKING CHANGE"
REPOSITORY_SCOPES="web|agent|ci|cli|deps|deps-dev|crux|crux-ui|kratos|crane|dagent"
COMMIT_MESSAGE="$1"

# Commit message format: COMMIT_TYPES(REPOSITORY_SCOPES): message
COMMIT_FORMAT="($COMMIT_TYPES)(\\(($REPOSITORY_SCOPES)\\))?: [\\w\\S]*"

if echo "$COMMIT_MESSAGE" | grep -E "$COMMIT_FORMAT" >/dev/null; then
  echo "Title is valid."
  exit 0
else
  echo "Title is invalid."
  exit 1
fi
