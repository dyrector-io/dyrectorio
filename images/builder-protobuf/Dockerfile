# this image is our official way of generating proto-files
# for reproducable builds, anywhere
# note: update this together with golang image
FROM docker.io/library/golang:1.22-alpine3.19

ENV GOLANGCI_LINT_CACHE $GOPATH/cache
ENV GOCACHE $GOPATH/cache

SHELL ["/bin/ash","-c"]
WORKDIR /usr/work
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/tree/develop/images/builder-protobuf"

RUN mkdir -p $GOPATH/src && \
    mkdir -p $GOPATH/bin && \
    mkdir -p $GOPATH/cache && \
    mkdir -p $GOPATH/pkg

RUN apk add nodejs npm alpine-sdk protoc protobuf-dev rsync docker git zstd openssl bash jq

RUN npm i -g \
        ts-proto@1.138.0 \
        @grpc/grpc-js \
        prettier

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

COPY ./golang/Makefile /tmp/
RUN cd /tmp && make install-go-tools && rm Makefile && chmod -R 777 $GOPATH/

