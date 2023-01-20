# this image is our official way of generating proto-files
# for reproducable builds, anywhere
FROM alpine:3.16

ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH
ENV GOLANGCI_LINT_CACHE $GOPATH/cache
ENV GOCACHE $GOPATH/cache

RUN mkdir -p "$GOPATH/{src,bin,cache}" && chmod -R 777 "$GOPATH"

RUN apk add nodejs npm alpine-sdk go protoc protobuf-dev rsync docker git cosign zstd

RUN npm i -g \
        ts-proto@1.125.0 \
        @grpc/grpc-js \
        prettier

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

COPY ./golang/Makefile /tmp/
RUN cd /tmp && make install-go-tools && rm Makefile

WORKDIR /usr/work
