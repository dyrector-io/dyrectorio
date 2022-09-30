# dyrector.io platform: protorepo

We are working on the source code documentation until, please use the root [README.md](../../README.md) for further information or check our official [documentation](https://docs.dyrector.io/) site.

Containing all dyrector.io related proto files and generating proto packages.

## Get started

### Install dependencies

```
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1
```

// TODO (polaroi8d): Generator docker image would be easier

For now if dependencies are installed (make, grpc, protoc) run the `make all` command in the project root folder, then commit changes

## Rules

### Naming conventions
#### A proto message can have 5 types of prefix:
-   Request: Must be in the names of method arguments
-   Response: Must be in the names of method returns
-   Message: Must be in the names of streams
-   Item: Optionally if a message is used in repeated fields
-   List: Optionally if a message's main data is repeated fields
#### Field indices in proto messages:
-   100-199: for non-_oneof_ fields
-   200-999: for _oneof_ fields usually partitioned by 100
-   1000-1999: for repeated fields (lists)

#### Field indices in requests / stream *Message*s:
-   1: id The identifier of the resource
-   2: accessedBy The identifier (kratos Id) of the user who's requesting the resource

#### Field indices in responses / stream *Message*s:
-   1: id The identifier of the resource
-   2: audit The timestamps and kratosIds of the last update and the creation of the resource
