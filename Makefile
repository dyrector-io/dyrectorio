
## compile docs
.PHONY: docs
docs:
	protoc -I. --doc_out=./docs --doc_opt=markdown,docs.md  proto/*.proto


UID := $(shell id -u)
PWD := $(shell pwd)

## Compile the proto files.
.PNONY: protogen
protogen:
	docker run -u  ${UID}:${UID} -v ${PWD}:/usr/work -t registry.gitlab.com/dyrector_io/dyrector.io/alpine-proto:3.16 ash -c "ls -la && cd protobuf && \
		mkdir -p go && \
		protoc -I. \
			--go_out=./go  \
			--go-grpc_out=./go  \
			--experimental_allow_proto3_optional \
			--plugin=protoc-gen-ts_proto \
			--ts_proto_opt=esModuleInterop=true \
			--ts_proto_opt=outputJsonMethods=true \
			--ts_proto_opt=useDate=false \
			--ts_proto_opt=outputServices=grpc-js \
			--ts_proto_out=../web/crux-ui/src/models \
			proto/*.proto && \
		rsync -r --delete ./go/gitlab.com/dyrector_io/dyrector.io/protobuf/go/** ./go && \
		rm -r ./go/gitlab.com/"

## make wonders happen - build everything -  !!!  token `|` is for parallel execution
.PHONY: all
all: | protogen docs


.PHONY: build-proto-image
build-proto-image:
	docker build -t registry.gitlab.com/dyrector_io/dyrector.io/alpine-proto:3.16 images/proto