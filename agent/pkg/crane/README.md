# crane

Implement the current interface for k8s deployments

## Development

### Strategies

- Conventional Commits: [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
- Semantic Versioning: [semver.org](https://semver.org)
- Branching policy: Gitflow Workflow
  [nvie.com/posts/a-successful-git-branching-model/](https://nvie.com/posts/a-successful-git-branching-model/)

### Requirement

##### Software

- go version: 1.17

##### Edit gitconfig

Add url to `~/.gitconfig` file: 

```
[url "git@gitlab.com:"]
insteadOf = https://gitlab.com/
```
##### Crux

`crux` is our dyrectorio backend service, if you would like to use `crane` you have to start the Crux as well. If you are in the local environment and don't want to start up the whole application just, delete or comment out the GRPC ports settings in the `.env` file.

##### Authenticate to Kubernetes Cluster

For local development, you have to log in to some Kubernetes Cluster, for this purpose, we are using IBM Cloud Cluster nowadays (recommended). Please request credentials for IBM Cloud and after it, install the IBM Cloud CLI tool: 

  - `ibmcloud login` - login to IBM Cloud
  - `ibm ks cluster config -c ${cluster_id}` - add token to your local 

### Start

```
go run .
```


Development
```
go get -u github.com/mitranim/gow
gow run .
```

Clean up go modules
```
go mod tidy
```

Generate proto files
``` sh
make protogen
```

### Swagger

```
go get -u github.com/swaggo/swag/cmd/swag
```

Regenerate swagger files - this is not automatic, please execute on change

```
swag init --parseDependency --parseInternal --parseVendor
```

### Debug

Needed for debugging:

- https://github.com/go-delve/delve
- Go Tools for VSCode
- Add launch json: Launch package

### Debug locally using Remote Instance

1. Install ngrok - https://ngrok.com/
2. Start crane locally
3. Add/Modify your ngrok URL using the dyrector.io UI eg. _d41a98d7ba2c.ngrok.io_

### Linting

https://golangci-lint.run/

Run installed tool with like so

```
golangci-lint run
```

### Changelog

Install the generator
```
go get -u github.com/git-chglog/git-chglog/cmd/git-chglog
```

Usage
```
git-chglog -o CHANGELOG.md
```

```
git tag -a v1.x.x
git push --tags
```

In order to draft a new release: 
- create a new release tag on develop
- generate changelogs

See [CHANGELOG.md](CHANGELOG.md) 

### Test

#### Setup k3s
``` sh
make k3s-start
make k3s-config
# run this to clean up
# make k3s-clean
```

Being at the repository root, after setting it up execute
``` sh
make k3s-test
```
For testing, to debug tests, overriding the KUBECONFIG variable as it is done 
in the Makefile.

Calculate coverage
``` sh
./dev/coverage.sh
# the relative route is important
```

## Deployment

Configuration will prioritize Environmental Variables, .env file, and defaults in this order with Environmental variables taking the highest priority.

Configuration will take place before starting up the application, and store the configuration options in a global variable, which can be accessed during runtime. Both crane and DAgent have their own configuration package to add their own defaults and/or add their own custom variables. When the variables are used to achieve similar functions, can be found in both projects, and have the same defaults; then it can be found in a "common" config package. Please see the common README.md for more.

| Environment variable        | Description                                     | Default               |
| -                           | -                                               | -                     |
| CRANE_GEN_TCP_INGRESS_MAP   | *Under obsoletion*                              | *none*                |
| CRANE_IN_CLUSTER            | Put `true` to use in-cluster auth               | true                  |
| DEFAULT_KUBE_TIMEOUT        | Kube                                            | 2m                    |
| FIELD_MANAGER_NAME          | Field manager name                              | crane-dyrector-io     |
| FORCE_ON_CONFLICTS          | Use `Force: true` while deploying               | true                  |
| KEY_ISSUER                  | The key/label name for audit purposes           | co.dyrector.io/issuer |
| KUBECONFIG                  | The "kubectl" configuration location            | *none*                |
| TEST_TIMEOUT                | Timeouts used in tests, no effect on deployment | 15s                   |

### In-cluster
uses the current namespace's default serviceaccount 

Deploy crane into a cluster:
  - deploy with yaml files or other crane
  - add `Admin` RoleBinding to namespace (better use RBAC, not sure all roles needed)
### Off-cluster
Uses the home folder of the user, it is a kubeconfig file

Steps:
- get a valid kubeconfig  file - be able to run `kubectl get all`
- run

## Tools

### GRPC

Install [grpcurl](https://github.com/fullstorydev/grpcurl), see example request.

```
grpcurl -plaintext localhost:50051 agent.Agent.Deploy
```


## Questions

If you have any questions please ask your teammates and extend the documentation with the missing pieces. Thanks ✌️
