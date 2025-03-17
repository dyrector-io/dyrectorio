SHELL = /bin/sh
GO_PACKAGE = github.com/dyrector-io/dyrectorio/protobuf/go

# Shortcut to start stack, fully containerized, stable build
.PHONY: up
up:
	cd golang && \
	make up

.PHONY: down
down:
	cd golang && \
	make down

# Shortcut to start stack with local development config
.PHONY: upd
upd:
	cd golang && \
	make upd

.PHONY: downd
downd:
	cd golang && \
	make downd

.PHONY: dwd
dwd: downd

# Shortcut for CLI
.PHONY: cli
cli:
	cd golang/cmd/dyo && \
	go run .

# Run the interactive compose-file config generator
.PHONY: compose-init
compose-init:
	cd golang && make init-cli
	go run ./golang/cmd/dyo/main.go  generate compose --compose-dir "distribution/compose"

# Create dyrector.io offline installer bundle
.PHONY: export-minimal
export-minimal:
	$(eval BUNDLEVER=$(or $(version),latest))
	mv .env .env_bak || true
	echo "DYO_VERSION=$(BUNDLEVER)" > .env
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/kratos:latest offline/kratos.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/crux:latest offline/crux.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/crux-ui:latest offline/crux-ui.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/agent/dagent:latest offline/dagent.tar
	cp docker-compose.yaml offline/
	cp .env.example offline/
	zip -r dyrectorio-offline-bundle-min-amd64-$(BUNDLEVER).zip offline
	mv .env_bak .env || true

.PHONY: export-full
export-full:
	$(eval BUNDLEVER=$(or $(version),latest))
	mv .env .env_bak || true
	echo "DYO_VERSION=$(BUNDLEVER)" > .env
	crane pull --platform=linux/amd64 docker.io/library/traefik:2.9 offline/traefik.tar
	crane pull --platform=linux/amd64 docker.io/library/postgres:13-alpine offline/postgresql.tar
	crane pull --platform=linux/amd64 docker.io/oryd/mailslurper:smtps-latest offline/mailslurper.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/kratos:latest offline/kratos.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/crux:latest offline/crux.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/web/crux-ui:latest offline/crux-ui.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/agent/dagent:latest offline/dagent.tar
	crane pull --platform=linux/amd64 ghcr.io/dyrector-io/dyrectorio/agent/crane:latest offline/crane.tar
	cp docker-compose.yaml offline/
	cp .env.example offline/
	zip -r dyrectorio-offline-bundle-full-amd64-$(BUNDLEVER).zip offline
	mv .env_bak .env || true

# Compile the all gRPC files
.PHONY: protogen
protogen:| proto-agent proto-crux

# Run linting on the Go code
.PHONY: go-lint
go-lint:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/builder-images/protobuf:3 ash -c "\
		cd golang && make lint"

# Generate agent gRPC files
.PHONY: proto-agent
proto-agent:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/builder-images/protobuf:3 ash -c "\
		mkdir -p protobuf/go && \
		protoc -I. \
			--go_out /tmp \
			--go_opt module=$(REMOTE) \
			--go-grpc_out /tmp \
			--go-grpc_opt module=$(REMOTE) \
			protobuf/proto/*.proto && \
		cp -r /tmp/${GO_PACKAGE}/* ./protobuf/go"

# Generate API grpc files
.PHONY: proto-crux
proto-crux:
	MSYS_NO_PATHCONV=1 docker run --rm -u ${UID}:${GID} -v ${PWD}:/usr/work ghcr.io/dyrector-io/dyrectorio/builder-images/protobuf:3 ash -c "\
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

.PHONY: branch-check
branch-check:
	@branch=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$branch" = "main" ] || [ "$$branch" = "develop" ]; then \
		echo "You are on main / develop branch."; \
	else \
		echo "!!!WARNING: You are not on the main or develop branch!"; \
		exit 1; \
	fi


# Define a macro for updating version numbers in various files
define update_version
	jq $(1) $(2) > $(2).tmp
	mv $(2).tmp $(2)
endef

# use on the branch to-release (develop or main for hotfixes)
.PHONY: release
release: branch-check
	$(info Do you want to continue? Version will be: $(version) from branch: $(shell git rev-parse --abbrev-ref HEAD))
	read

	git pull --tags

	@if git checkout -b "release/$(version)"; then \
		echo "Branch release/$(version) created and checked out"; \
	else \
		echo "Branch release/$(version) already exists, checking out"; \
		git checkout "release/$(version)"; \
	fi

# Create changelog
	git-chglog --next-tag $(version) -o CHANGELOG.md
	git add CHANGELOG.md

# Change the golang version
	sed 's/Version *=.*/Version = "$(version)"/' golang/internal/version/version.go > temp_file && mv temp_file golang/internal/version/version.go
	git add golang/internal/version/version.go

# Change version of crux
	$(call update_version,'.version = "$(version)"', web/crux/package.json)
	$(call update_version,'.version = "$(version)"', "web/crux/package-lock.json")
	$(call update_version,'.packages."".version = "$(version)"', web/crux/package-lock.json)
	sed "s/AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION = '[0-9]*\.[0-9]*\.[0-9]*'/AGENT_PROTO_COMPATIBILITY_MINIMUM_VERSION = '$(version)'/g" web/crux/src/shared/const.ts > temp_file && mv temp_file web/crux/src/shared/const.ts
	git add web/crux/

# Change version of crux-ui
	$(call update_version,'.version = "$(version)"', web/crux-ui/package.json)
	$(call update_version,'.version = "$(version)"', "web/crux-ui/package-lock.json")
	$(call update_version,'.packages."".version = "$(version)"', web/crux-ui/package-lock.json)
	git add web/crux-ui/

# Finalizing changes
	git commit -m "release: $(version)"
	git tag -sm "$(version)" $(version)

	git checkout -
	git merge --ff-only release/$(version)

.PHONY: test-integration
test-integration:
	cd golang && \
	make test-integration

.PHONY: format
format:
	yamlfmt .

# Generate video with gource, needs ffmpeg and gource installed
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
