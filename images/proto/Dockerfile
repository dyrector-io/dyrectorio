FROM alpine:3.16

RUN apk add nodejs npm alpine-sdk go && npm i -g ts-proto

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26 && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1

WORKDIR /usr/work