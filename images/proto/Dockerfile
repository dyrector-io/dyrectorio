# this image is our official way of generating proto-files
# for reproducable builds, anywhere
FROM alpine:3.16

ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH
ENV GOLANGCI_LINT_CACHE $GOPATH/cache
ENV GOCACHE $GOPATH/cache

RUN mkdir -p "$GOPATH/{src,bin,cache}" && chmod -R 777 "$GOPATH"

RUN apk add nodejs npm alpine-sdk go protoc protobuf-dev rsync docker git cosign

RUN npm i -g \
    ts-proto@1.125.0 \
    @grpc/grpc-js \
    prettier

ENV GOSEC v2.14.0
ENV GOLANGCI v1.46.2
ENV GOSWAG v1.8.3


RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2 && \
    go install github.com/golangci/golangci-lint/cmd/golangci-lint@$GOLANGCI && \
	go install github.com/swaggo/swag/cmd/swag@$GOSWAG && \
	go install github.com/securego/gosec/v2/cmd/gosec@$GOSEC

WORKDIR /usr/work
