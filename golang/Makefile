SHELL=/bin/sh

PACKAGE := github.com/dyrector-io/dyrectorio/golang
ORG_REGISTRY := ghcr.io/dyrector-io/dyrectorio
DOCKER_REGISTRY := docker.io/dyrectorio
AGENT_REGISTRY_URL := ${ORG_REGISTRY}/agent
ORG_GOLANG_HASH="$(shell git rev-parse --short HEAD:../golang)"

# UTC timestamps for builds
BUILD_TIMESTAMP="$(shell date -u +"%Y-%m-%dT%H:%M:%SZ" | tr -d "[:blank:]")"

LDFLAGS := -ldflags "-X '${PACKAGE}/internal/version.BuildTimestamp=${BUILD_TIMESTAMP}'\
  -X '${PACKAGE}/internal/version.CommitHash=${ORG_GOLANG_HASH}'\
  -extldflags '-static'"

# default tag is latest for building
image_version ?= latest

GOAIR=v1.45.0
GOSEC=v2.17.0
GOLANGCI=v1.54.2
GOFUMPT=v0.5.0
YAMLFMT=v0.9.0

# support for: linux darwin windows
GOOS?=linux

# support for: amd64 arm64
GOARCHS?=amd64 arm64

ifeq ($(GOOS),windows)
	OUT_EXT=.exe
endif

ifdef $(GRPC_DEBUG)
	GRPC_DEBUG_FLAGS=GRPC_GO_LOG_VERBOSITY_LEVEL=99 GRPC_GO_LOG_SEVERITY_LEVEL=info
endif

GOPARAMS:= CGO_ENABLED=0 $(GRPC_DEBUG_FLAGS)

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

# target `upd` is for development purposes it defaults to the latest images
# and expects crux and crux-ui to run locally
.PHONY: upd
upd:
	cd cmd/dyo && \
	go run . --disable-crux --disable-crux-ui --image-tag latest --prefix dyo-latest up

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
	$(foreach arch, $(GOARCHS), $(foreach os, $(GOOS), ${GOPARAMS} GOARCH=$(arch) GOOS=${os} go build ${LDFLAGS} -o ../../build/out/dyo-${os}-${arch}${OUT_EXT};))

.PHONY: install-cli
install-cli: single-arch-check compile-cli
	ifeq ($(GOBIN),)
		$(error GOBIN environment variable is empty)
	endif
	cp build/out/cli-$(GOARCHS) $(GOBIN)/

.PHONY: compile-crane
compile-crane:
	cd cmd/crane && \
	$(foreach arch, $(GOARCHS), $(foreach os, $(GOOS), ${GOPARAMS} GOARCH=$(arch) GOOS=${os} go build ${LDFLAGS} -o ../../build/out/crane-${os}-${arch}${OUT_EXT};))

.PHONY: compile-dagent
compile-dagent:
	cd cmd/dagent && \
	$(foreach arch, $(GOARCHS), $(foreach os, $(GOOS), ${GOPARAMS} GOARCH=$(arch) GOOS=${os} go build ${LDFLAGS} -o ../../build/out/dagent-${os}-${arch}${OUT_EXT};))

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
	golangci-lint run -c ../.golangci.yml ./...

.PHONY: build-cli
build-cli:
	cd build && \
	docker buildx build  --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64 --load -t ${ORG_REGISTRY}/cli/dyo:$(image_version) -t ${DOCKER_REGISTRY}/dyo:$(image_version) -f cli/Dockerfile .

.PHONY: build-cli-push
build-cli-push:
	cd build && \
	docker buildx build  --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64,linux/arm64 --push -t ${ORG_REGISTRY}/cli/dyo:$(image_version) -t ${DOCKER_REGISTRY}/dyo:$(image_version) -f cli/Dockerfile .

.PHONY: build-dagent
build-dagent: compile-dagent
	cd build && \
	docker buildx build --build-arg AGENT_BINARY=dagent --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64 --load -t ${AGENT_REGISTRY_URL}/dagent:$(image_version) -t ${DOCKER_REGISTRY}/dagent:$(image_version) .

.PHONY: build-crane
build-crane: compile-crane
	cd build && \
	docker buildx build  --build-arg AGENT_BINARY=crane --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64 --load -t ${AGENT_REGISTRY_URL}/crane:$(image_version) -t ${DOCKER_REGISTRY}/crane:$(image_version) .

PHONY: build-dagent-multi-push
build-dagent-multi-push: compile-dagent
	cd build && \
	docker buildx build --build-arg AGENT_BINARY=dagent --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64,linux/arm64 --push -t ${AGENT_REGISTRY_URL}/dagent:$(image_version) -t ${DOCKER_REGISTRY}/dagent:$(image_version) .

.PHONY: build-crane-multi-push
build-crane-multi-push: compile-crane
	cd build && \
	docker buildx build  --build-arg AGENT_BINARY=crane --build-arg REVISION=${ORG_GOLANG_HASH} --platform=linux/amd64,linux/arm64 --push -t ${AGENT_REGISTRY_URL}/crane:$(image_version) -t ${DOCKER_REGISTRY}/crane:$(image_version) .

.PHONY: cli-compile-build-push
cbpcli:	compile-cli build-cli push-cli

# short alias for the previous target
.PHONY: cbpcli
cbpcli:	cli-compile-build-push

.PHONY: build-agents
build-agents: build-dagent build-crane

.PHONY: build-both-push-both
build-both-push-both: build-crane-multi-push build-dagent-multi-push

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
	docker push ${DOCKER_REGISTRY}/crane:$(image_version)

.PHONY: push-dagent
push-dagent:
	docker push ${AGENT_REGISTRY_URL}/dagent:$(image_version)
	docker push ${DOCKER_REGISTRY}/dagent:$(image_version)

.PHONY: push-agents
push-agents: | push-crane push-dagent

.PHONY: push-all
push-all: | push-crane push-dagent push-cli

.PHONY: binfmt
binfmt:
	docker run --privileged --rm tonistiigi/binfmt --install arm64,amd64

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
	k3d kubeconfig get crane-test > k3d-auth.yaml && \
	KUBECONFIG=$(PWD)/k3d-auth.yaml kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
	KUBECONFIG=$(PWD)/k3d-auth.yaml kubectl apply -f ./crane-test.yaml

# config k3d
.PHONY: k3d-config
k3d-config:
	k3d kubeconfig get crane-test > k3d-auth.yaml

.PHONY: k3d-start
k3d-start:
	k3d cluster start crane-test

.PHONY: k3d-stop
k3d-stop:
	k3d cluster stop crane-test

# make sure to have k3s set and configured
.PHONY: k3d-test
k3d-test: k3d-test
	export KUBECONFIG='$(PWD)/k3d-auth.yaml'
	go test -tags=integration -race ./pkg/crane/...

.PHONY: k3d-rm
k3d-rm:
	k3d cluster delete crane-test

# dependency: valid & working k8s configuration
.PHONY: test-unit
test-unit:
	go test -tags=unit -race ./...

# dependency: valid & working k8s configuration
.PHONY: test-unit-with-coverage
test-unit-with-coverage:
	go test -tags=unit -race -coverpkg=./... -coverprofile=./unit.cov -covermode=atomic ./...

.PHONY: test-integration
test-integration: test-dagent test-crane test-cli test-internal

.PHONY: test-crane
test-crane:
	go test -tags=integration -race -coverpkg=./... -coverprofile=./crane.cov -covermode=atomic ./pkg/crane/...

.PHONY: test-internal
test-internal:
	go test -tags=integration -race -coverpkg=./... -coverprofile=./internal.cov -covermode=atomic ./internal/...
	go test -tags=integration -race -coverpkg=./... -coverprofile=./builder.cov -covermode=atomic ./pkg/builder/...

.PHONY: test-dagent
test-dagent:
	go test -tags=integration -race -coverpkg=./... -coverprofile=./dagent.cov -covermode=atomic ./pkg/dagent/...

.PHONY: test-cli
test-cli:
	go test -tags=integration -race -coverpkg=./... -coverprofile=./cli.cov -covermode=atomic ./pkg/cli/...

.PHONY: coverage
coverage:
	go tool cover -func ./merged.cov
