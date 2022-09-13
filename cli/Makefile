PACKAGE := github.com/dyrector-io/dyrectorio/agent
CONTAINER_URL := ghcr.io/dyrector-io/dyrectorio/agent/
VCS_VERSION="$(shell git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD)"
AGENT_HASH="$(shell git rev-parse --short HEAD:../agent)"

# UTC timestamps for builds
BUILD_TIMESTAMP="$(shell date -u +"%Y-%m-%dT%H:%M:%SZ" | tr -d "[:blank:]")"

agent_version=$(or $(VCS_VERSION),$(AGENT_HASH))

LDFLAGS := -ldflags "-X '${PACKAGE}/internal/version.Version=${VCS_VERSION}'\
  -X '${PACKAGE}/internal/version.BuildTimestamp=${BUILD_TIMESTAMP}'\
  -X '${PACKAGE}/internal/version.CommitHash=${AGENT_HASH}'\
  -extldflags '-static'"

# default tag is latest for building
image_version ?= latest

GOSEC=v2.12.0
GOLANGCI=v1.46.2
GOSWAG=v1.8.3

GOOS?=linux

ifeq ($(GOOS),windows)
	OUT_EXT=.exe
endif

.PHONY: install-go-tools
install-go-tools: ##
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@${GOLANGCI} && \
	go install github.com/swaggo/swag/cmd/swag@${GOSWAG} && \
	go install github.com/securego/gosec/v2/cmd/gosec@${GOSEC}

.PHONY: security
security: # running gosec for static code analysis for bugs and leaks
	gosec ./...

.PHONY: lint
lint: # golangci for linting
	golangci-lint run  ./... --timeout=3m
