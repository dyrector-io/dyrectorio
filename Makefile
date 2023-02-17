
SHELL = /bin/sh

## shortcut to start stack
.PHONY: up
up:
	cd golang && \
	make up

# shortcut to start stack with local development
.PHONY: upd
upd:
	cd golang && \
	make upd

# shortcut for cli
.PHONY: cli
cli:
	cd golang/cmd/dyo && \
	go run .

.PHONY: down
down:
	cd golang && \
	make down

## compile docs
.PHONY: docs
docs:
	protoc -I. --doc_out=./docs --doc_opt=markdown,docs.md  proto/*.proto


UID := $(shell id -u)
GID := $(shell id -g)
PWD := $(shell pwd)
REMOTE=github.com/dyrector-io/dyrectorio/protobuf/go

## Compile the all grpc files
.PHONY: protogen
protogen:| proto-agent proto-crux proto-crux-ui

## Generate agent grpc files
.PHONY: proto-agent
proto-agent:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.17-1 ash -c "\
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
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.17-1 ash -c "\
		mkdir -p ./web/crux/src/grpc && \
		protoc \
			--experimental_allow_proto3_optional \
			--plugin=/usr/local/lib/node_modules/ts-proto/protoc-gen-ts_proto \
			--ts_proto_opt=nestJs=true \
			--ts_proto_opt=addNestjsRestParameter=true \
			--ts_proto_opt=outputJsonMethods=true \
			--ts_proto_opt=addGrpcMetadata=true \
			--ts_proto_out=./web/crux/src/grpc \
			protobuf/proto/*.proto" && \
	cp -r protobuf/proto web/crux/ && \
	cd ./web/crux/src/grpc && \
	npx prettier -w "./**.ts"

# Generate UI grpc files, note the single file
.PHONY:  proto-crux-ui
proto-crux-ui:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.17-1 ash -c "\
		mkdir -p ./web/crux-ui/src/models/grpc && \
		protoc \
			--experimental_allow_proto3_optional \
			--plugin=/usr/local/lib/node_modules/ts-proto/protoc-gen-ts_proto \
			--ts_proto_opt=esModuleInterop=true \
			--ts_proto_opt=outputJsonMethods=true \
			--ts_proto_opt=useDate=false \
			--ts_proto_opt=outputServices=grpc-js \
			--ts_proto_out=./web/crux-ui/src/models/grpc \
			--ts_proto_opt=initializeFieldsAsUndefined=false \
			protobuf/proto/crux.proto" && \
	cd ./web/crux-ui/src/models/grpc && \
	npx prettier -w "**.ts"

## make wonders happen - build everything -  !!!  token `|` is for parallel execution
.PHONY: all
all: | protogen docs

.PHONY: build-proto-image
build-proto-image:
	docker build -t ghcr.io/dyrector-io/dyrectorio/alpine-proto:3.17-1 -f images/alpine-proto/Dockerfile .

.PHONY: release
release:
	echo "Version will be: $(version)"
	echo "Do you want to continue?"
	read

	git checkout develop
	git pull
	git checkout -b "release/$(version)"

## Create changelog
	git-chglog --next-tag $(version) -o CHANGELOG.md
	git add CHANGELOG.md

## Change version of crux
	jq 'walk(if type == "object" and has("version") then .version |= "$(version)" else . end)' web/crux/package.json > web/crux/package.json.tmp
	mv web/crux/package.json.tmp web/crux/package.json
	jq 'walk(if type == "object" and has("version") then .version |= "$(version)" else . end)' web/crux/package-lock.json > web/crux/package-lock.json.tmp
	mv web/crux/package-lock.json.tmp web/crux/package-lock.json
	git add web/crux/

## Change version of crux-ui
	jq 'walk(if type == "object" and has("version") then .version |= "$(version)" else . end)' web/crux-ui/package.json > web/crux-ui/package.json.tmp
	mv web/crux-ui/package.json.tmp web/crux-ui/package.json
	jq 'walk(if type == "object" and has("version") then .version |= "$(version)" else . end)' web/crux-ui/package-lock.json > web/crux-ui/package-lock.json.tmp
	mv web/crux-ui/package-lock.json.tmp web/crux-ui/package-lock.json
	git add web/crux-ui/

## Finalizing changes
	git commit -m "release: $(version)"
	git tag -sm "$(version)" $(version)

## Generate video with gource, needs ffmpeg and gource installed
.PHONY: gource
gource:
	gource \
		-1920x1080 \
		--seconds-per-day 1 \
		--auto-skip-seconds 1 \
		--file-idle-time 0 \
		--high-dpi \
		--logo ./docs/dyrectorio-dark-small.png \
		--logo-offset 1650x30 \
		--multi-sampling \
		-r 60 \
		-o - | \
		ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - -vcodec libx264 \
		-preset ultrafast -pix_fmt yuv420p -crf 1 -threads 0 -bf 0 git-history-visualization.mp4
