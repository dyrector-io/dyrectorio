# CHANGELOG


<a name="v1.1.0"></a>
## [v1.1.0](https://gitlab.com/dyrector_io/server-agent/compare/v1.0.3...v1.1.0) (2021-12-13)

### Ci

* dev build executes only on develop branch
* docker auth into docker build steps
* default before_script override for docker-build
* fix typo, added dind image to build
* private protorepo ssh access in docker build
* gosec pkg version provided
* vendoring issues, order changed in gitlab.yml
* security test lifted from image
* attempt to build using vendoring
* added alpine sdk, gcc needed
* attempt to use alpine image
* added ./caps folder to tests
*  removed uneeded before script from test
*  removed API test from ci
* added missing jq to env

### Clean

* verbose variable names for merge
* fixed lint issues, variadic join in use

### Feat

* log config, version check, swagger everywhere
* add dyo-node-id to metadata
* deploy batch version implemented
* release generation, version deploy, swagger fixes
* port range with validation and swagger fix

### Fix

* remove unnecerssary context overwrite
* review fixes, typos, removed comment
* type in readme
* merged gitlab ci files flattened pipeline
* less (loop cycle) is more in mapMerge functions
* curl-test reverted to previous deploy endpoint
* file path security cleaned for release
* module clean-up, use recent protorepo tag
* protorepo accidental local rewrite removed
* golangci latest image for up-to-date go version

### New

* server-side tls, inc. localhost crt

### Refactor

* moved preflight into utils for cleaner main

### Test

* deploy response added to API test

### Update

* matching crane

### Merge Requests

* Merge branch 'CRX-147-log-config' into 'develop'
* Merge branch 'CRX-54-node-auth' into 'develop'
* Merge branch 'metadata-node-id' into 'develop'
* Merge branch 'DEV-110-ci-private-repository' into 'develop'
* Merge branch 'DEV-105-berci-dagent-updates' into 'develop'
* Merge branch 'update/matching-crane' into 'develop'


<a name="v1.0.3"></a>
## [v1.0.3](https://gitlab.com/dyrector_io/server-agent/compare/v1.0.2...v1.0.3) (2021-10-07)

### Docs

* changelog v1.0.3 generated
* v1.0.2 changelog generated

### Feat

* user added to container config

### Fix

* fix the container status endpoint uri
* Remove unnecessary HTTPStatus code usage
* Add preName and name to containers (as query param)
* change the optional params

### Merge Requests

* Merge branch 'fix/status-endpoint' into 'develop'
* Merge branch 'feat/container-user' into 'develop'


<a name="v1.0.2"></a>
## [v1.0.2](https://gitlab.com/dyrector_io/server-agent/compare/v1.0.1...v1.0.2) (2021-09-13)

### Clean

* container get status now expects seperate query params

### Docs

* v1.0.1 changlelog generated
* readme changelog cmds reordered

### Feat

* restart policy added to builder

### Merge Requests

* Merge branch 'clean/seperate-prefix' into 'develop'
* Merge branch 'fix/poll-interval' into 'develop'
* Merge branch 'feat/restart-policy' into 'develop'


<a name="v1.0.1"></a>
## [v1.0.1](https://gitlab.com/dyrector_io/server-agent/compare/v1.0.0...v1.0.1) (2021-08-30)

### Docs

* v1.0.1 changlelog generated
* readme changelog cmds reordered
* changelog generation + docs

### Fix

* timezone mount for updater

### Merge Requests

* Merge branch 'feat/batch-deploy' into 'develop'
* Merge branch 'fix/updater-timezone' into 'develop'
* Merge branch 'docs/changelog-generation' into 'develop'


<a name="v1.0.0"></a>
## v1.0.0 (2021-08-16)

### Ci

* added dind for test
* added missing dependency
* docker build-push dyrector.io registry
* dind port fix
* docker build to dyrector.io registry

### Feat

* automatic update via webhook or poll
* signalr

### Feature

* add const for container states
* Implement delete container function

### Fix

* readme update, swagger now generates
* swagger localhost string removed
* appsettings.json path corrected
* container exact name matching solves issues
* handling host & local host path mismatch
* support for relative mount paths
* removed swallowed errors, removing containers on newer ones

### Format

* golangci lint errors corrected

### New

* instanceconfig separated model, tests
* json comment support, DeployRequest optional fields
* container env support, config merging, tests
* dockerization, drop-in compatibility, more logs
* deploy host port bindings
* deploy container, volume mounts
* swagger, tests, structure
* get containers, get status

### Refactor

* sending more logs over with signalr, more logs
* add error models feat: add inspect container endpoint

### Style

* removed commented code

### Test

* dind-go container added
* added coverage script, tests moved to files
* docker in go image
* now executes tests

### Wip

* deploy

### Merge Requests

* Merge branch 'feat/auto-update' into 'develop'
* Merge branch 'feat/batch-deploy-api' into 'develop'
* Merge branch 'fix/swagger-url' into 'develop'
* Merge branch 'test/reorganize-and-coverage' into 'develop'
* Merge branch 'docs/general-readme' into 'develop'
* Merge branch 'fix/container-appconfig-path' into 'develop'
* Merge branch 'fix/container-exact-matching' into 'develop'
* Merge branch 'fix/host-container-path' into 'develop'
* Merge branch 'fix/relative-mount-paths' into 'develop'
* Merge branch 'fix/better-logs' into 'develop'
* Merge branch 'refactor/signalr' into 'develop'
* Merge branch 'ci/docker-build' into 'develop'
* Merge branch 'feat/signalr' into 'develop'
* Merge branch 'feat/container-inspect' into 'develop'
* Merge branch 'feat/container-status' into 'develop'
* Merge branch 'feat/deploy-helios' into 'main'
* Merge branch 'feat/deployment-envs' into 'main'
* Merge branch 'main' into 'feat/containerization'
* Merge branch 'feature/cicd' into 'main'
* Merge branch 'format/golintci-gitignore' into 'main'
* Merge branch 'feat/deployment-ports' into 'main'
* Merge branch 'feat/deployment-volumes' into 'main'

