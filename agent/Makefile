
git_short_hash=$(or $(shell git rev-parse --short HEAD),${CI_COMMIT_SHORT_SHA})

# default tag is latest for building
image_version ?= latest

.PHONY: docs swaggen test all debug-grpc bbdp compile-dagent compile-crane build-both test-crane test-dagent


gow-crane: ##
	cd cmd/crane && \
	gow run . ; \
	cd -

gow-dagent: ##
	cd cmd/dagent && \
	gow run . ; \
	cd -

compile-crane: ##
	cd cmd/crane && \
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags "-extldflags '-static'" -o ../../build/out/crane; \
	cd -

compile-dagent: ##
	cd cmd/dagent && \
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags "-extldflags '-static'" -o ../../build/out/dagent; \
	cd -


compile-both: compile-crane compile-dagent


security: # running gosec for static code analysis for bugs and leaks
	gosec ./...

lint: # golangci for linting 
	golangci-lint run ./...

build-dagent: ##
	cd build && \
	docker build --build-arg CO_BIN_NAME=dagent -t registry.gitlab.com/dyrector_io/dyrector.io/go/dagent:$(image_version) -t registry.gitlab.com/dyrector_io/dyrector.io/go/dagent:$(git_short_hash) . && \
	cd -

build-crane: ##
	cd build && \
	docker build --build-arg CO_BIN_NAME=crane -t registry.gitlab.com/dyrector_io/dyrector.io/go/crane:$(image_version) -t registry.gitlab.com/dyrector_io/dyrector.io/go/crane:$(git_short_hash) . && \
	cd -

build-both: build-dagent build-crane

# build push both
bbpb: build-both push-both

swagger-dagent: # generate openapi docs for agent
	cd pkg/dagent && swag init -g dagent.go --parseDependency --parseInternal --parseVendor && \
	cd -

swagger-crane: # generate openapi docs for crane
	cd pkg/crane && swag init -g crane.go --parseDependency --parseInternal --parseVendor && \
	cd -

swaggen: swagger-crane swagger-dagent

push-crane: ##
	docker push registry.gitlab.com/dyrector_io/dyrector.io/go/crane:$(image_version) && \
	docker push registry.gitlab.com/dyrector_io/dyrector.io/go/crane:$(git_short_hash)
push-dagent: ##
	docker push registry.gitlab.com/dyrector_io/dyrector.io/go/dagent:$(image_version) && \
	docker push registry.gitlab.com/dyrector_io/dyrector.io/go/dagent:$(git_short_hash)

push-both: push-crane push-dagent


# todo: put these into use
k3d-start: #start k3d
	if [ -z "$(shell which k3d)" ]; then \
        echo "k3d is required for integration test, install it and add to PATH!"; \
    fi
	k3d cluster create crane-cluster

k3d-config: # config k3d
	k3d kubeconfig get crane-cluster > k3s.yaml

k3d-test: # make sure to have k3s set and configured
	KUBECONFIG=$(PWD)/k3s.yaml go test -tags=integration -race ./pkg/crane/...

k3s-start: # start k3s with docker
	docker run --name k3s -d -p 6443:6443 -p 8081:8081 registry.gitlab.com/gitlab-org/cluster-integration/test-utils/k3s-gitlab-ci/releases/v1.22.2-k3s2:latest
	
k3s-config:
	curl -sf localhost:8081 > k3s.yaml && \
	sed -i 's/k3s:6443/localhost:6443/g' ./k3s.yaml 

k3s-clean: #
	docker stop k3s && docker rm k3s; rm -r ./k3s.yaml

k3s-test: # make sure to have k3s set and configured
	KUBECONFIG=$(PWD)/k3s.yaml go test -tags=integration -race ./pkg/crane/...

test-unit: # dependency: valid & working k8s configuration
	go test -tags=unit -race ./...

test-unit-with-cov: # dependency: valid & working k8s configuration
	go test -tags=unit -race -coverpkg=./pkg/... -coverprofile=./coverage.cov ./...

test-dagent-docker:
	go test -tags=integration -race ./pkg/dagent/...

test: test-crane test-dagent

coverage: #
	go test -tags=unit -v -coverpkg=./pkg/... -coverprofile=./coverage.cov ./...
	go tool cover -func ./coverage.cov

# ==== what is below is still under refactor ====

docs: # generate godocs markdown
	gomarkdoc . ./controller ./k8s ./model ./route ./util > docs/godoc.md


debug-grpc: # this can be used to print all gRPC connection info
	GRPC_GO_LOG_VERBOSITY_LEVEL=99 GRPC_GO_LOG_SEVERITY_LEVEL=info go run .

