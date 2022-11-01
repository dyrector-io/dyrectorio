PACKAGE := github.com/dyrector-io/dyrectorio/golang
ORG_REGISTRY := ghcr.io/dyrector-io/dyrectorio
AGENT_REGISTRY_URL := ${ORG_REGISTRY}/agent
VCS_VERSION="$(shell git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD)"
ORG_GOLANG_HASH="$(shell git rev-parse --short HEAD:../golang)"

# UTC timestamps for builds
BUILD_TIMESTAMP="$(shell date -u +"%Y-%m-%dT%H:%M:%SZ" | tr -d "[:blank:]")"

vcs_version=$(or $(VCS_VERSION),$(ORG_GOLANG_HASH))

LDFLAGS := -ldflags "-X '${PACKAGE}/pkg/version.Version=${VCS_VERSION}'\
  -X '${PACKAGE}/pkg/version.BuildTimestamp=${BUILD_TIMESTAMP}'\
  -X '${PACKAGE}/pkg/version.CommitHash=${ORG_GOLANG_HASH}'\
  -extldflags '-static'"

# default tag is latest for building
image_version ?= latest

GOAIR=v1.40.4
GOSEC=v2.14.0
GOLANGCI=v1.46.2
GOSWAG=v1.8.3

GOOS?=linux

ifeq ($(GOOS),windows)
	OUT_EXT=.exe
endif

.PHONY: up
up: ##
	cd cmd/dyo && \
	go run . up; \
	cd -

.PHONY: upd
upd: ##
	cd cmd/dyo && \
	go run . --disable-crux --disable-crux-ui up; \
	cd -

.PHONY: down
down: ##
	cd cmd/dyo && \
	go run . down; \
	cd -

.PHONY: go-crane
go-crane: ##
	air --build.cmd "cd cmd/crane; go build -o crane_bin ." --build.bin "cd cmd/crane; ./crane_bin"

.PHONY: go-dagent
go-dagent: ##
	air --build.cmd "cd cmd/dagent; go build -o dagent_bin ." --build.bin "cd cmd/dagent; ./dagent_bin"


.PHONY: compile-cli
compile-cli: ##
	cd cmd/dyo && \
	GOARCH=amd64 CGO_ENABLED=0 go build ${LDFLAGS} -o ../../build/out/dyo${OUT_EXT}; \
	cd -

.PHONY: compile-crane
compile-crane: ##
	cd cmd/crane && \
	GOARCH=amd64 CGO_ENABLED=0 go build ${LDFLAGS} -o ../../build/out/crane${OUT_EXT}; \
	cd -

.PHONY: compile-dagent
compile-dagent: ##
	cd cmd/dagent && \
	GOARCH=amd64 CGO_ENABLED=0 go build ${LDFLAGS} -o ../../build/out/dagent${OUT_EXT}; \
	cd -

.PHONY: install-go-tools
install-go-tools: ##
	go install github.com/cosmtrek/air@${GOAIR} && \
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@${GOLANGCI} && \
	go install github.com/swaggo/swag/cmd/swag@${GOSWAG} && \
	go install github.com/securego/gosec/v2/cmd/gosec@${GOSEC}

.PHONY: compile-agents
compile-agents: compile-crane compile-dagent

.PHONY: security
security: # running gosec for static code analysis for bugs and leaks
	gosec ./...

.PHONY: lint
lint: # golangci for linting
	golangci-lint run  ./... --timeout=3m

.PHONY: build-cli
build-cli: ##
	cd build && \
	docker build -t ${ORG_REGISTRY}/cli:$(image_version) -f cli/Dockerfile . && \
	cd -

.PHONY: build-dagent
build-dagent: ##
	cd build && \
	docker build --build-arg CO_BIN_NAME=dagent -t ${AGENT_REGISTRY_URL}/dagent:$(image_version) -t ${AGENT_REGISTRY_URL}/dagent:$(vcs_version) . && \
	cd -

.PHONY: build-crane
build-crane: ##
	cd build && \
	docker build --build-arg CO_BIN_NAME=crane -t ${AGENT_REGISTRY_URL}/crane:$(image_version) -t ${AGENT_REGISTRY_URL}/crane:$(vcs_version) . && \
	cd -

.PHONY: cbpcli
cbpcli:	compile-cli build-cli push-cli


.PHONY: build-agents
build-agents: build-dagent build-crane


.PHONY: bbpb # build push both
bbpb: build-agents push-agents

.PHONY: swagger-dagent
swagger-dagent: # generate openapi docs for agent
	cd pkg/dagent && swag init --instanceName Dagent -g dagent.go --parseDependency --parseInternal --parseVendor && \
	cd -

.PHONY: swagger-crane
swagger-crane: # generate openapi docs for crane
	cd pkg/crane && swag init --instanceName Crane -g crane.go --parseDependency --parseInternal --parseVendor && \
	cd -

.PHONY: swaggen
swaggen: | swagger-crane swagger-dagent

.PHONY: push-cli
push-cli: ##
	docker push ${ORG_REGISTRY}/cli:$(image_version)
	docker push ${ORG_REGISTRY}/cli:$(vcs_version)

.PHONY: push-crane
push-crane: ##
	docker push ${AGENT_REGISTRY_URL}/crane:$(image_version)
	docker push ${AGENT_REGISTRY_URL}/crane:$(vcs_version)

.PHONY: push-dagent
push-dagent: ##
	docker push ${AGENT_REGISTRY_URL}/dagent:$(image_version)
	docker push ${AGENT_REGISTRY_URL}/dagent:$(vcs_version)
.PHONY: push-agents
push-agents: | push-crane push-dagent


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

# ==== what is below is still under refactor ====

docs: # generate godocs markdown
	gomarkdoc . ./controller ./k8s ./model ./route ./util > docs/godoc.md


debug-grpc: # this can be used to print all gRPC connection info
	GRPC_GO_LOG_VERBOSITY_LEVEL=99 GRPC_GO_LOG_SEVERITY_LEVEL=info go run .
