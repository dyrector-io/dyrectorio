SHELL=/bin/sh

PACKAGE := github.com/dyrector-io/dyrectorio/golang
ORG_REGISTRY := ghcr.io/dyrector-io/dyrectorio
DOCKER_REGISTRY := docker.io/dyrectorio
AGENT_REGISTRY_URL := ${ORG_REGISTRY}/agent
VCS_VERSION=$(shell git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD)
ORG_GOLANG_HASH="$(shell git rev-parse --short HEAD:../golang)"

# UTC timestamps for builds
BUILD_TIMESTAMP="$(shell date -u +"%Y-%m-%dT%H:%M:%SZ" | tr -d "[:blank:]")"

vcs_version=$(or $(VCS_VERSION),$(ORG_GOLANG_HASH))

LDFLAGS := -ldflags "-X '${PACKAGE}/internal/version.Version=${VCS_VERSION}'\
  -X '${PACKAGE}/internal/version.BuildTimestamp=${BUILD_TIMESTAMP}'\
  -X '${PACKAGE}/internal/version.CommitHash=${ORG_GOLANG_HASH}'\
  -extldflags '-static'"

# default tag is latest for building
image_version ?= latest

GOAIR=v1.42.0
GOSEC=v2.15.0
GOLANGCI=v1.51.2
GOFUMPT=v0.4.0
YAMLFMT=v0.9.0

GOOS?=linux

# all linux architectures
GOARCHS?=amd64 arm64

ifeq ($(GOOS),windows)
	OUT_EXT=.exe
endif

ifdef $(GRPC_DEBUG)
	GRPC_DEBUG_FLAGS=GRPC_GO_LOG_VERBOSITY_LEVEL=99 GRPC_GO_LOG_SEVERITY_LEVEL=info
endif

GOPARAMS:=GOOS=$(GOOS) CGO_ENABLED=0 $(GRPC_DEBUG_FLAGS)

# cli start fully containerized stack, stable branch
.PHONY: up
up:
	cd cmd/dyo && \
	go run . up

# cli stop
.PHONY: down
down:
	cd cmd/dyo && \
	go run . down

# upd is short for up dev
.PHONY: upd
upd:
	cd cmd/dyo && \
	go run . --disable-crux --disable-crux-ui --prefix dyo-latest up

.PHONY: downd
downd:
	cd cmd/dyo && \
	go run . --prefix dyo-latest down

.PHONY: go-crane
go-crane:
	air --build.cmd "" --build.bin "cd cmd/crane && go run ."

.PHONY: go-crane-init
go-crane-init:
	cd cmd/crane && \
	go run . init

.PHONY: go-dagent
go-dagent:
	air --build.cmd "" --build.bin "cd cmd/dagent && go run ."

.PHONY: cli
cli:
	cd cmd/dyo && \
	go run .

.PHONY: compile
compile: | compile-cli compile-crane compile-dagent

.PHONY: single-arch-check
single-arch-check:
	$(info GOARCHS = $(GOARCHS))
	$(info GOARCHS has $(words $($(strip GOARCHS))) elements)
	ifeq (1,0)
		$(warning Multiple architectures were defined: $(GOARCHS))
		$(error Only one single architecture should be used. Use 'GOARCHS=<target-arch> make target')
	endif

.PHONY: compile-cli
compile-cli:
	cd cmd/dyo && \
	$(foreach arch, $(GOARCHS), ${GOPARAMS} GOARCH=$(arch) go build ${LDFLAGS} -o ../../build/out/dyo-${arch}${OUT_EXT};)

.PHONY: install-cli
install-cli: single-arch-check compile-cli
	ifeq ($(GOBIN),)
		$(error GOBIN environment variable is empty)
	endif
	cp build/out/cli-$(GOARCHS) $(GOBIN)/

.PHONY: compile-crane
compile-crane:
	cd cmd/crane && \
	$(foreach arch, $(GOARCHS), ${GOPARAMS} GOARCH=$(arch) go build ${LDFLAGS} -o ../../build/out/crane-${arch}${OUT_EXT};)

.PHONY: compile-dagent
compile-dagent:
	cd cmd/dagent && \
	$(foreach arch, $(GOARCHS), ${GOPARAMS} GOARCH=$(arch) go build ${LDFLAGS} -o ../../build/out/dagent-${arch}${OUT_EXT};)

.PHONY: install-go-tools
install-go-tools:
	go install github.com/cosmtrek/air@${GOAIR}
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@${GOLANGCI}
	go install github.com/securego/gosec/v2/cmd/gosec@${GOSEC}
	go install mvdan.cc/gofumpt@${GOFUMPT}
	go install github.com/google/yamlfmt/cmd/yamlfmt@${YAMLFMT}

.PHONY: compile-agents
compile-agents: compile-crane compile-dagent

# running gosec for static code analysis for bugs and leaks
.PHONY: security
security:
	gosec ./...

# golangci for linting
.PHONY: lint
lint:
	golangci-lint run  ./...

.PHONY: build-cli
build-cli:
	cd build && \
	docker build -t ${ORG_REGISTRY}/cli/dyo:$(image_version) -t ${DOCKER_REGISTRY}/dyo:$(image_version) -f cli/Dockerfile .

.PHONY: build-dagent
build-dagent:
	cd build && \
	docker build --build-arg AGENT_BINARY=dagent --platform=linux/amd64 -t ${AGENT_REGISTRY_URL}/dagent:$(image_version) -t ${AGENT_REGISTRY_URL}/dagent:$(vcs_version) -t ${DOCKER_REGISTRY}/dagent:$(image_version) .

.PHONY: build-crane
build-crane:
	cd build && \
	docker build --build-arg AGENT_BINARY=crane --platform=linux/amd64 -t ${AGENT_REGISTRY_URL}/crane:$(image_version) -t ${AGENT_REGISTRY_URL}/crane:$(vcs_version) -t ${DOCKER_REGISTRY}/crane:$(image_version) .

.PHONY: build-dagent
build-multi-dagent: compile-dagent
	cd build && \
	docker buildx build --build-arg AGENT_BINARY=dagent --platform=linux/amd64,linux/arm64 --push -t ${AGENT_REGISTRY_URL}/dagent:$(image_version) -t ${AGENT_REGISTRY_URL}/dagent:$(vcs_version) -t ${DOCKER_REGISTRY}/dagent:$(image_version) .

.PHONY: build-crane
build-multi-crane: compile-crane
	cd build && \
	docker buildx build  --build-arg AGENT_BINARY=crane --platform=linux/amd64,linux/arm64 --push -t ${AGENT_REGISTRY_URL}/crane:$(image_version) -t ${AGENT_REGISTRY_URL}/crane:$(vcs_version) -t ${DOCKER_REGISTRY}/crane:$(image_version) .

.PHONY: cli-compile-build-push
cbpcli:	compile-cli build-cli push-cli

# short alias for the previous target
.PHONY: cbpcli
cbpcli:	cli-compile-build-push

.PHONY: build-agents
build-agents: build-dagent build-crane

.PHONY: build-agents-multi
build-agents-multi: build-multi-dagent build-multi-crane

.PHONY: build-both-push-both
build-both-push-both: build-agents-multi push-agents

# short alias for the previous target
.PHONY: bbpb
bbpb: build-both-push-both

.PHONY: push-cli
push-cli:
	docker push ${ORG_REGISTRY}/dyo:$(image_version)
	docker push ${DOCKER_REGISTRY}/dyo:$(image_version)

.PHONY: push-crane
push-crane:
	docker push ${AGENT_REGISTRY_URL}/crane:$(image_version)
	docker push ${AGENT_REGISTRY_URL}/crane:$(vcs_version)
	docker push ${DOCKER_REGISTRY}/crane:$(image_version)

.PHONY: push-dagent
push-dagent:
	docker push ${AGENT_REGISTRY_URL}/dagent:$(image_version)
	docker push ${AGENT_REGISTRY_URL}/dagent:$(vcs_version)
	docker push ${DOCKER_REGISTRY}/dagent:$(image_version)

.PHONY: push-agents
push-agents: | push-crane push-dagent

.PHONY: push-all
push-all: | push-crane push-dagent push-cli


.PHONY: k3d-check
k3d-check:
	if [ -z "$(shell which k3d)" ]; then \
        echo "k3d is required for integration test, install it and add to PATH!"; \
    fi

# init k3d with basic
.PHONY: k3d-init
k3d-init: k3d-check
	k3d cluster create --api-port 172.17.0.1:6443 crane-test

# init k3d with ext
.PHONY: k3d-init-ext
k3d-init-ext: k3d-check
	k3d cluster create --api-port 172.17.0.1:6443 crane-test && \
	k3d kubeconfig get crane-test > k3d.yaml && \
	KUBECONFIG=$(PWD)/k3d.yaml kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# config k3d
.PHONY: k3d-config
k3d-config:
	k3d kubeconfig get crane-test > k3d.yaml

.PHONY: k3d-start
k3d-start:
	k3d cluster start crane-test

.PHONY: k3d-stop
k3d-stop:
	k3d cluster stop crane-test

# make sure to have k3s set and configured
.PHONY: k3d-test
k3d-test: k3d-config
	export KUBECONFIG='$(PWD)/k3d.yaml'
	go test -tags=integration -race ./pkg/crane/...

k3d-rm:
	k3d cluster delete crane-test

# dependency: valid & working k8s configuration
.PHONY: test-unit
test-unit:
	go test -tags=unit -race ./...

# dependency: valid & working k8s configuration
.PHONY: test-unit-with-coverage
test-unit-with-coverage:
	go test -tags=unit -race -coverpkg=./... -coverprofile=./coverage.cov -covermode=atomic ./...

.PHONY: test-integration
test-integration: test-dagent test-crane test-cli test-internal

.PHONY: test-crane
test-crane:
	go test -tags=integration -race ./pkg/crane/...

.PHONY: test-internal
test-internal:
	go test -tags=integration -race ./internal/...
	go test -tags=integration -race ./pkg/helper/...
	go test -tags=integration -race ./pkg/builder/...

.PHONY: test-dagent
test-dagent:
	go test -tags=integration -race ./pkg/dagent/...

.PHONY: coverage
coverage:
	go tool cover -func ./coverage.cov
