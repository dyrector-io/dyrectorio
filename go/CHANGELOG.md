# CHANGELOG


<a name="v2.1.0"></a>
## [v2.1.0](https://gitlab.com/dyrector_io/server-agent/compare/v1.0.0...v2.1.0) (2022-06-22)

### Clean

* comments fixed, added
* removed unnecessary notes

### Docs

* drafted version 2.0, first version of co

### Feat

* jwt grpc crane and dagent
* import file functionality added to dagent
* import file functionality added to dagent

### Feature

* implement gRPC communication to crane
* implement gRPC communication to crane

### Fix

* container status http query aligned to core
* removed go.mod unused packages
* unhandled error, message is logged
* lint, unused function excluded
* review fixes, variable names, comments
* unhandled error, message is logged
* lint, unused function excluded
* panics and conflict are fixed
* docker build and docker image push to the registry

### Hotfix

* add requested-with to cors policies

### Refactor

* grpc moved into separate pkg

### Style

* removed unecessary line

### Merge Requests

* Merge branch 'feat/crx-51_node_setup_jwt' into 'develop'
* Merge branch 'CRX-194/refactor-env-configuration' into 'develop'
* Merge branch 'CRX-126/feat/crane-grpc' into 'develop'
* Merge branch 'fix/crx-225_get-container-status' into 'develop'
* Merge branch 'CRX-225/feat/dagent-import' into 'develop'
* Merge branch 'hotfix/fetch_certificate_from_domains' into 'develop'
* Merge branch 'CRX-186/fix/conflicts-panics-integration' into 'develop'
* Merge branch 'fix/dockerbuild' into 'develop'
* Merge branch 'refactor/CRX-181_proto_messages' into 'develop'
* Merge branch 'fix/status-panics' into 'develop'
* Merge branch 'hotfix/cors-requested-with' into 'develop'


<a name="v1.0.0"></a>
## v1.0.0 (2022-04-13)

### Ci

* getting shorthash fixed
* docker fix
* more inclusive change watch rule
* temporally removed integration tests - inconsistency
* coverage refactored into one job
* name corrections
* registry auth fixed for gitlab registry
* added missing deps (alpine-sdk) to image build
* docker image removed version
* docker-dind version bumped
* makefile missing dagent target added
* gitlab-ci images replaced for go 1.17

### Clean

* lint error fixed

### Feat

* loadbalancer annotations

### Fix

* status panics, maybe because of binding error
* security, lint error fixes
* review fixes, comments and naming
* pvc attach fail make the deploy fail
* missing svc selector & pipeline cleanups
* pvc is attached regardless of apply's outcome
* pipeline and test fixes

### New

* traefik features + refactor

### Refactor

* test refactors, restart refactor
* dogger mini-refactor, batch/version responses corrected
* crane and dagent merged into a single repo

### Style

* more consistent use of %q

### Test

* fixed quoting in the deploy file
* restart policy is optional, better fails ^^

### Merge Requests

* Merge branch 'fix/deployment-restart-always' into 'develop'
* Merge branch 'feat/traefik-refactor-merge' into 'develop'
* Merge branch 'feat/CRX-63_deploy_deployment' into 'develop'
* Merge branch 'fix/pvc-error-fail' into 'develop'
* Merge branch 'fix/svc-missing-selector' into 'develop'
* Merge branch 'fix/pvc-conflict-attach' into 'develop'
* Merge branch 'feat/load-balancer-annotation' into 'develop'

