#! /bin/sh

grpcurl -plaintext -d @ -import-path ./protos -proto crux.proto 192.168.1.125:5000 io.dyrector.svc.crux.ProductService/CreateProduct <<EOM
{
    "name": "testamentum",
    "description": "beala",
    "type": 1,
    "createdBy": "6ebbb948-0749-4857-aa5e-5504221dc984"
}
EOM