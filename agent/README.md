# dyrector.io agent components

Components were developed individually, but common code, structs and functions made it rational to move them into a single repository.
It is frequent that changes have to be synced between the two.

## Guidelines

The structure is borrowed from: https://github.com/kubernetes/kubernetes

## Development

### Prerequirements

 - golangci-lint is a Go linters aggregator: [Installation Guide](https://golangci-lint.run/usage/install/#local-installation)

Everything that is done frequently should be possible using the makefile, if not, ask for help or make it so.

| Environment variable    | Description                                                                                               | Default                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| DEFAULT_LIMITS_CPU      | *self explanatory*                                                                                        | 100m                                   |
| DEFAULT_LIMITS_MEMORY   | *self explanatory*                                                                                        | 128Mi                                  |
| DEFAULT_REQUESTS_CPU    | *self explanatory*                                                                                        | 50m                                    |
| DEFAULT_REQUESTS_MEMORY | *self explanatory*                                                                                        | 64Mi                                   |
| DEFAULT_VOLUME_SIZE     | Default volume size to use when not defined                                                               | 1G                                     |
| DEFAULT_TIMEOUT         | timeout with GRPC connections, format is time.Duration                                                    | 5s                                     |
| GIN_MODE                | Using release is fine, debug is for development                                                           | release                                |
| GRPC_ADDRESS            | Backend GRPC address                                                                                      | localhost:5000                         |
| GRPC_INSECURE           | Use GRPRC without TLS (for development)                                                                   | true                                   |
| GRPC_KEEPALIVE          | GRPC keepalive interval, format is time.Duration                                                          | 60s                                    |
| PORT                    | HTTP port to use                                                                                          | 8080                                   |
| IMPORT_CONTAINER_IMAGE  | Import container name                                                                                     | rclone/rclone:1.57.0                   |
| INGRESS_ROOT_DOMAIN     | Domain name for Ingress                                                                                   | *none*                                 |
| NODE_ID                 | ID of the node                                                                                            | cb7e9573-9a43-4d5b-8005-eb8bb7a423c4"` |
| READ_HEADER_TIMEOUT     | Gin read header timeout, configured to protect against Slowloris type attacks (form of denial of service) | 15s                                    |
| REGISTRY                | Default registry address                                                                                  | index.docker.io                        |
| REGISTRY_PASSWORD       | Password of the remote registry where DAgent is located                                                   | *none*                                 |
| REGISTRY_USERNAME       | User of the remote registry where DAgent is located                                                       | *none*                                 |

