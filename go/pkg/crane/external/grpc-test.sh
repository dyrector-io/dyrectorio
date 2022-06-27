#!/bin/sh


grpcurl -plaintext -d @ localhost:50051 agent.Agent.Deploy <<EOM
{
    "requestId": "12345",
    "imageName": "nginx",
    "tag": "latest",
    "containerConfig": {
        "name": "nginx-test",
        "ports": [{"internal": 80, "external": 8080}],
        "mounts": ["data|/usr/share/nginx/html"],
        "configContainer": {
            "image": "reg.dyrector.io/library/data-example:latest",
            "volume": "data",
            "path": "/data/**"
        },
        "expose": {
            "tls": true,
            "public": true
        }
    },
    "instanceConfig": {
        "prefix": "grpc"
    }
}
EOM