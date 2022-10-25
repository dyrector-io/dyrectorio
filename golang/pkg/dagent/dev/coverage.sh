#!/bin/sh

go test -tags=unit -v -coverpkg=./... -coverprofile=./dev/profile.cov ./...
go tool cover -func ./dev/profile.cov
