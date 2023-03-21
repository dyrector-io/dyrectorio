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

GOAIR=v1.40.4
GOSEC=v2.14.0
GOLANGCI=v1.50.1
GOFUMPT=v0.4.0

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

.PHONY: up
up:
	cd cmd/dyo && \
	go run . up

.PHONY: upd
upd:
	cd cmd/dyo && \
	go run . --disable-crux --disable-crux-ui --prefix dyo-latest up

.PHONY: down
down:
	cd cmd/dyo && \
	go run . down

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
	go install github.com/cosmtrek/air@${GOAIR} && \
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@${GOLANGCI} && \
	go install github.com/securego/gosec/v2/cmd/gosec@${GOSEC}
	go install mvdan.cc/gofumpt@${GOFUMPT}

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

.PHONY: k3d-start # todo: put these into use
k3d-start: #start k3d
	if [ -z "$(shell which k3d)" ]; then \
        echo "k3d is required for integration test, install it and add to PATH!"; \
    fi
	k3d cluster create crane-cluster

.PHONY: k3d-config
k3d-config: # config k3d
	k3d kubeconfig get crane-cluster > k3s.yaml

.PHONY: k3d-test
k3d-test: # make sure to have k3s set and configured
	KUBECONFIG=$(PWD)/k3s.yaml go test -tags=integration -race ./pkg/crane/...

.PHONY: k3s-start
k3s-start: # start k3s with docker
	docker run --name k3s -d -p 6443:6443 -p 8081:8081 registry.gitlab.com/gitlab-org/cluster-integration/test-utils/k3s-gitlab-ci/releases/v1.22.2-k3s2:latest

.PHONY: k3s-config
k3s-config:
	curl -sf localhost:8081 > k3s.yaml && \
	sed -i 's/k3s:6443/localhost:6443/g' ./k3s.yaml

.PHONY: k3s-clean
k3s-clean: #
	docker stop k3s && docker rm k3s; rm -r ./k3s.yaml

.PHONY: k3s-test
k3s-test: # make sure to have k3s set and configured
	KUBECONFIG=$(PWD)/k3s.yaml go test -tags=integration -race ./pkg/crane/...

.PHONY: test-unit
test-unit: # dependency: valid & working k8s configuration
	go test -tags=unit -race ./...

.PHONY: test-unit-with-coverage
test-unit-with-coverage: # dependency: valid & working k8s configuration
	go test -tags=unit -race -coverpkg=./... -coverprofile=./coverage.cov -covermode=atomic ./...

.PHONY: test-dagent-docker
test-dagent-docker:
	go test -tags=integration -race ./pkg/dagent/...

.PHONY: coverage
coverage:
	go tool cover -func ./coverage.cov
