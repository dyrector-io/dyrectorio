# this image is our official way of generating proto-files
# for reproducable builds, anywhere
FROM docker.io/library/golang:1.20-alpine3.17

ENV GOLANGCI_LINT_CACHE $GOPATH/cache
ENV GOCACHE $GOPATH/cache

SHELL ["/bin/ash","-c"]

RUN mkdir -p $GOPATH/src && \
    mkdir -p $GOPATH/bin && \
    mkdir -p $GOPATH/cache && \
    mkdir -p $GOPATH/pkg

RUN apk add nodejs npm alpine-sdk protoc protobuf-dev rsync docker git cosign zstd openssl1.1-compat bash

RUN npm i -g \
        ts-proto@1.138.0 \
        @grpc/grpc-js \
        prettier

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

COPY ./golang/Makefile /tmp/
RUN cd /tmp && make install-go-tools && rm Makefile && chmod -R 777 $GOPATH/

RUN curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
RUN curl -L -o /usr/bin/kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && chmod +x /usr/bin/kubectl


WORKDIR /usr/work

LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/tree/develop/images/alpine-proto"

