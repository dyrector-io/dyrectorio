# this image is our official way of generating proto-files
# for reproducable builds, anywhere
FROM alpine:3.16

ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH

RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

RUN apk add nodejs npm alpine-sdk go protoc protobuf-dev rsync

RUN npm i -g ts-proto@1.96.0 @grpc/grpc-js

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

WORKDIR /usr/work