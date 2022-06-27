#!/bin/sh

go test -v -coverpkg=./... -coverprofile=./dev/profile.cov ./...
go tool cover -func ./dev/profile.cov
