#!/bin/sh

curl -X POST -d '@test.json' localhost:8080/v1/deploy


curl -X POST -d '@test-version.json' localhost:8080/v1/deploy/version
