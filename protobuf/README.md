# Protorepo
Containing all dyrector.io related proto files
and generating proto packages


## Generated docs
See [docs.md](./docs/docs.md)



## How-to

Install dependencies
```
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1
```

Generator docker image would be easier
Make, grpc, protoc


For now if deps are installed
```
make all
```
Then commit changes.

In order to use it flawlessly in your git workflow.
Force git to use ssh (with go this works very well).
```
git config --global url.git@gitlab.com:.insteadOf https://gitlab.com/
```

## crux.proto naming conventions

A proto message can have 5 types of prefix:
- Request:  Must be in the names of method arguments
- Response: Must be in the names of method returns
- Message:  Must be in the names of streams
- Item:     Optionally if a message is used in repeated fields
- List:     Optionally if a message's main data is repeated fields

Field indices in proto messages:
- 100-199: for non-*oneof* fields
- 200-999: for *oneof* fields usually partitioned by 100
- 1000-1999: for repeated fields (lists)

Field indices in requests / stream *Message*s:
- 1: id             The identifier of the resource
- 2: accessedBy     The identifier (kratos Id) of the user who's requesting the resource

Field indices in responses / stream *Message*s:
- 1: id             The identifier of the resource
- 2: audit          The timestamps and kratosIds of the last update and the creation of the resource
