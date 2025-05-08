# note: update this together with protobuf image
FROM docker.io/library/golang:1.23-alpine3.20

ENV GOLANGCI_LINT_CACHE $GOPATH/cache
ENV GOCACHE $GOPATH/cache

SHELL ["/bin/ash","-c"]
WORKDIR /usr/work
LABEL org.opencontainers.image.source="https://github.com/dyrector-io/dyrectorio/tree/develop/distribution/images/alpine-proto"

RUN mkdir -p $GOPATH/src && \
    mkdir -p $GOPATH/bin && \
    mkdir -p $GOPATH/cache && \
    mkdir -p $GOPATH/pkg

RUN apk add alpine-sdk docker git zstd bash curl

# Need these for integration tests
RUN curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
RUN curl -L -o /usr/bin/kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && chmod +x /usr/bin/kubectl

COPY ./golang/Makefile /tmp/
RUN cd /tmp && make install-go-tools && rm Makefile && chmod -R 777 $GOPATH/

