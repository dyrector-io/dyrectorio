# dyrector.io platform: dagent
We are working on the source code documentation, until then please use the root [README.md](../../../README.md) for further information or check our official [documentation](https://docs.dyrector.io/) site.

Implement the current interface for Docker deployments.

### Swagger

```
go get -u github.com/swaggo/swag/cmd/swag
```

Regenerate swagger files - this is not automatic, please execute on change

```
swag init --parseDependency --parseInternal --parseVendor
```

Swagger is available on a running instance at eg. http://localhost:8080/swagger/index.html#
Note the index.html is important to refer explicitly.

### Debug

Needed for debugging:

-   https://github.com/go-delve/delve
-   Go Tools for VSCode
-   Add launch json: Launch package

### Debug locally using Remote Instance

1. Install ngrok - https://ngrok.com/
2. Start DAgent locally
3. Add/Modify your ngrok URL using the dyrector.io UI eg. _d41a98d7ba2c.ngrok.io_

### Linting

https://golangci-lint.run/

Run installed tool with like so

AUR install

```
paru -S golangci-lint
```

```
golangci-lint run
```

### Test

Execution of tests of the package with verbose output

```sh
go test -v ./...
# add -race flag to include testing for race conditions
```

Calculate coverage

```sh
./dev/coverage.sh
# the relative route is important
```

### Environment variables

```
DATA_MOUNT_PATH=/srv/dagent
GIN_MODE=release
```

## Deployment

Docker connection is needed,
mount host /var/run/docker.sock into the container.

`DYO_GRPC_ADDRESS` or `PORT` is needed to bind gRPC or http services respectively.

At present, in gRPC dagent has client role so the port binding is implicit, no explicit port exposure is needed.

Configuration will prioritize Environmental Variables, .env file, and defaults in this order with Environmental variables taking the highest priority.

Configuration will take place before starting up the application, and store the configuration options in a global variable, which can be accessed during runtime. Both crane and DAgent have their own configuration package to add their own defaults and/or add their own custom variables. When the variables are used to achieve similar functions, can be found in both projects, and have the same defaults; then it can be found in a "common" config package. Please see the common README.md for more.

| Environmental Variable | Description                                                                                                   | default value                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| AGENT_CONTAINER_NAME   | name of the container                                                                                         | dagent-go                             |
| DAGENT_IMAGE           | Fully qualified image name with registry incl. without protocol                                               | ghcr.io/dyrector-io/dyrectorio/dagent |
| NAME            | DAgent container name, it is needed for the update                                                            | dagent                                |
| DATA_MOUNT_PATH        | This should match the mount path that is the root of configurations and containers                            | /srv/dagent                           |
| DEFAULT_TAG            | default tag to use with container images in deployment                                                        | latest                                |
| HOST_DOCKER_SOCK_PATH  | Path of `docker.sock` or other local/remote address where we can communicate with docker                      | /var/run/docker.sock                  |
| INTERNAL_MOUNT_PATH    | Containers mount path default                                                                                 | /srv/dagent                           |
| LOG_DEFAULT_SKIP       | Loglines to skip                                                                                              | 0                                     |
| LOG_DEFAULT_TAKE       | Loglines to take                                                                                              | 100                                   |
| MIN_DOCKER_VERSION     | Minimum required docker version, it's exposed to help debugging and also help podman users                    | 20.10                                 |
| TRAEFIK_ACME_MAIL      | E-mail address to use for dynamic certificate requests                                                        | _none_                                |
| TRAEFIK_ENABLED        | _self explanatory_                                                                                            | false                                 |
| TRAEFIK_LOG_LEVEL      | Loglevel for Traefik                                                                                          | _none_                                |
| TRAEFIK_TLS            | Whether to enable traefik TLS or not                                                                          | false                                 |
| UPDATER_CONTAINER_NAME | Container name for the updater container, useful if multiple instances are running                            | dagent-updater                        |
| UPDATE_HOST_TIMEZONE   | Whether to mount localtime into the update container                                                          | true                                  |
| UPDATE_METHOD          | Values: `off`, `webhook`, `poll`                                                                              | off                                   |
| UPDATE_POLL_INTERVAL   | Agent polling frequency, should be defined in time.Duration parseable format (eg. 10s, 20m, 1h20m, 4395s etc) | 600s                                  |
| WEBHOOK_TOKEN          | Token used by the webhook to trigger the update                                                               | _none_                                |

Example docker run command

```sh
docker run \
  --name dagent-go \
  -p 9923:8080 \
  -e GIN_MODE=release \
  -e DATA_MOUNT_PATH=/home/nandor/.dagent \
  -e UPDATE_REGISTRY_USER='registry' \
  -e UPDATE_REGISTRY_PASSWORD='password' \
  -e WEBHOOK_TOKEN=UUID-TOKEN \
  -e DISCORD_WEBHOOK_URL="your_webhook_url" \
  -e HOSTNAME=$(HOST) \
  -e UPDATE_METHOD=poll \
  -v /home/nandor/.dagent:/srv/dagent \
  -v /var/run/docker.sock:/var/run/docker.sock  \
  --restart unless-stopped \
  -d  \
  ghcr.io/dyrector-io/dyrectorio/dagent:latest
```

### Update

Webhook example with cURL

```sh
curl -X POST localhost:8080/update -H "Content-Type: application/json" \
-d '{"token": "UUID-TOKEN"}'
```

### TLS

Server-side TLS is downloaded upon connection to the server (if need be).

## Questions

If you have any questions please ask your teammates and extend the documentation with the missing pieces. Thanks ✌️
