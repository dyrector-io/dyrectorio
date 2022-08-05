
## compile docs
.PHONY: docs
docs:
	protoc -I. --doc_out=./docs --doc_opt=markdown,docs.md  proto/*.proto


UID := $(shell id -u)
GID := $(shell id -g)
PWD := $(shell pwd)
REMOTE=github.com/dyrector-io/dyrectorio/protobuf/go

## Compile the all grpc files
.PNONY: protogen
protogen:| proto-agent proto-crux proto-crux-ui

## Generate agent grpc files
.PHONY: proto-agent
proto-agent:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v "${PWD}":/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.16 ash -c "\
		mkdir -p protobuf/go && \
		protoc -I. \
			--go_out protobuf/go \
			--go_opt module=$(REMOTE) \
			--go-grpc_out protobuf/go \
			--go-grpc_opt module=$(REMOTE) \
			protobuf/proto/*.proto"

# Generate API grpc files
.PHONY: proto-crux
proto-crux:
	MSYS_NO_PATHCONV=1 docker run -u ${UID}:${GID} -v "${PWD}":/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.16 ash -c "\
		mkdir -p ./web/crux/src/grpc && \
		protoc -I. \
			--experimental_allow_proto3_optional \
			--plugin=/usr/local/lib/node_modules/ts-proto/protoc-gen-ts_proto \
			--ts_proto_opt=nestJs=true \
			--ts_proto_opt=addNestjsRestParameter=true \
			--ts_proto_opt=outputJsonMethods=true \
			--ts_proto_opt=addGrpcMetadata=true \
			--ts_proto_out=./web/crux/src/grpc \
			protobuf/proto/*.proto && \
		cp -r protobuf/proto web/crux/" && \
	cd ./web/crux && \
	npx prettier -w "./src/grpc/**/*.ts"

# Generate UI grpc files, note the single file
.PHONY:  proto-crux-ui
proto-crux-ui:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v "${PWD}":/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.16 ash -c "\
		mkdir -p ./web/crux-ui/src/models/grpc && \
		protoc -I. \
			--experimental_allow_proto3_optional \
			--plugin=/usr/local/lib/node_modules/ts-proto/protoc-gen-ts_proto \
			--ts_proto_opt=esModuleInterop=true \
			--ts_proto_opt=outputJsonMethods=true \
			--ts_proto_opt=useDate=false \
			--ts_proto_opt=outputServices=grpc-js \
			--ts_proto_out=./web/crux-ui/src/models/grpc \
			protobuf/proto/crux.proto" && \
		cd ./web/crux-ui && \
		npx prettier -w "./src/models/grpc/**/*.ts"

## make wonders happen - build everything -  !!!  token `|` is for parallel execution
.PHONY: all
all: | protogen docs


.PHONY: build-proto-image
build-proto-image:
	docker build -t ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.16 images/proto