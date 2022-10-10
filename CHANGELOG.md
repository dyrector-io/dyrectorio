# CHANGELOG


<a name="0.2.2"></a>
## [0.2.2](https://github.com/dyrector-io/dyrectorio/compare/0.2.1...0.2.2) (2022-10-10)

### Fix

* use prisma's openssl binaries to workaround the segfault comming from different openssl versions

### Release

* 0.2.1 ([#204](https://github.com/dyrector-io/dyrectorio/issues/204))


<a name="0.2.1"></a>
## [0.2.1](https://github.com/dyrector-io/dyrectorio/compare/v0.1.1...0.2.1) (2022-09-27)

### Add

* dyo cli ([#100](https://github.com/dyrector-io/dyrectorio/issues/100))

### Chore

* add cli to readme ([#176](https://github.com/dyrector-io/dyrectorio/issues/176))
* remove duplicated env and restructure for better readability ([#130](https://github.com/dyrector-io/dyrectorio/issues/130))
* add badges dark/light pictures and more documentation to README.md ([#123](https://github.com/dyrector-io/dyrectorio/issues/123))
* json editor better caret color for visibility ([#108](https://github.com/dyrector-io/dyrectorio/issues/108))

### Doc

* remove gitbook content from this repository ([#150](https://github.com/dyrector-io/dyrectorio/issues/150))
* extend user facing docs  ([#127](https://github.com/dyrector-io/dyrectorio/issues/127))
* add user facing docs ([#106](https://github.com/dyrector-io/dyrectorio/issues/106))

### Feat

* add make release
* add init-containers to crane ([#169](https://github.com/dyrector-io/dyrectorio/issues/169))
* add secret volume to k8s manifests ([#170](https://github.com/dyrector-io/dyrectorio/issues/170))
* secrets ([#153](https://github.com/dyrector-io/dyrectorio/issues/153))
* add networks to agent ([#135](https://github.com/dyrector-io/dyrectorio/issues/135))
* updated ts-proto ([#138](https://github.com/dyrector-io/dyrectorio/issues/138))
* extend container config ([#109](https://github.com/dyrector-io/dyrectorio/issues/109))
* replace nginx with traefik ([#107](https://github.com/dyrector-io/dyrectorio/issues/107))
* add env var for disable recaptcha
* team rework ([#79](https://github.com/dyrector-io/dyrectorio/issues/79))
* add container prefix, add createnetwork to traefik ([#75](https://github.com/dyrector-io/dyrectorio/issues/75))
* add gcr demo seeder ([#67](https://github.com/dyrector-io/dyrectorio/issues/67))
* pagination in auditlog ([#72](https://github.com/dyrector-io/dyrectorio/issues/72))
* implement google container registry ([#62](https://github.com/dyrector-io/dyrectorio/issues/62))
* DatePicker, DateRangeFilter, AuditLog filters ([#58](https://github.com/dyrector-io/dyrectorio/issues/58))

### Fix

* check directory for secret keys ([#203](https://github.com/dyrector-io/dyrectorio/issues/203))
* add spacing, change branch name
* cli versioning, make version package public
* remove v prefix from versioning
* change the mac folder and typo in env ([#193](https://github.com/dyrector-io/dyrectorio/issues/193))
* next startup error ([#182](https://github.com/dyrector-io/dyrectorio/issues/182))
* deploying on unreachable node ([#178](https://github.com/dyrector-io/dyrectorio/issues/178))
* add secrets attr to demo seeder ([#166](https://github.com/dyrector-io/dyrectorio/issues/166))
* primsa containerConfig defaults and dagent envs ([#158](https://github.com/dyrector-io/dyrectorio/issues/158))
* restrict name text length ([#121](https://github.com/dyrector-io/dyrectorio/issues/121))
* multiple ui fixes ([#102](https://github.com/dyrector-io/dyrectorio/issues/102))
* json editor scrolling ([#104](https://github.com/dyrector-io/dyrectorio/issues/104))
* useWebSocket hook & provider ([#93](https://github.com/dyrector-io/dyrectorio/issues/93))
* i18n improvement & remove unused type import & eslintrc vscode fix ([#101](https://github.com/dyrector-io/dyrectorio/issues/101))
* deploy registry URL ([#95](https://github.com/dyrector-io/dyrectorio/issues/95))
* deployment not moving to in-progress ([#89](https://github.com/dyrector-io/dyrectorio/issues/89))
* missing locales ([#77](https://github.com/dyrector-io/dyrectorio/issues/77))
* node card content ([#78](https://github.com/dyrector-io/dyrectorio/issues/78))

### Refactor

* split models and validation file ([#192](https://github.com/dyrector-io/dyrectorio/issues/192))
* remove circular dependency from registryConnections ([#143](https://github.com/dyrector-io/dyrectorio/issues/143))
* runtime recaptcha site key env ([#85](https://github.com/dyrector-io/dyrectorio/issues/85))
* make state and status name usage consistent ([#71](https://github.com/dyrector-io/dyrectorio/issues/71))
* websocket message routing

### Release

* 0.2.1

### Techdept

* add e2e tests ([#105](https://github.com/dyrector-io/dyrectorio/issues/105))


<a name="v0.1.1"></a>
## [v0.1.1](https://github.com/dyrector-io/dyrectorio/compare/v0.1.0...v0.1.1) (2022-08-03)

### Chore

* clean README.mds & generate changelog ([#57](https://github.com/dyrector-io/dyrectorio/issues/57))

### Fix

* rename the install script files ([#63](https://github.com/dyrector-io/dyrectorio/issues/63))
* change the manifest paths ([#60](https://github.com/dyrector-io/dyrectorio/issues/60))

### Release

* v0.1.1


<a name="v0.1.0"></a>
## [v0.1.0](https://github.com/dyrector-io/dyrectorio/compare/0.0.1...v0.1.0) (2022-08-01)

### Chore

* contributing update, editorconfig and gitattributes

### Cicd

* added codecov

### Doc

* setup steps & contributing gpg ([#35](https://github.com/dyrector-io/dyrectorio/issues/35))

### Feat

* k8s agent install, with manifests ([#43](https://github.com/dyrector-io/dyrectorio/issues/43))
* display agent version ([#28](https://github.com/dyrector-io/dyrectorio/issues/28))

### Fix

* proto makefile does not work on windows ([#52](https://github.com/dyrector-io/dyrectorio/issues/52))
* image edit websocket errors ([#44](https://github.com/dyrector-io/dyrectorio/issues/44))
* tsconfig parsing error in eslintrc
* eslint errors, and apple silicon readme
* add pre-commit-linter and add CONTRIBUTING.md
* add security readme
* readme and crux `.env` configuration

### Improvement

* remove multiple choice from <DyoChips> component  ([#23](https://github.com/dyrector-io/dyrectorio/issues/23))

### Refactor

* refactoring panic calls ([#53](https://github.com/dyrector-io/dyrectorio/issues/53))
* Remove config module ([#40](https://github.com/dyrector-io/dyrectorio/issues/40))

### Merge Requests

* Merge pull request [#56](https://github.com/dyrector-io/dyrectorio/issues/56) from dyrector-io/chore/editorconfig-gitattributes
* Merge pull request [#42](https://github.com/dyrector-io/dyrectorio/issues/42) from dyrector-io/fix/ts-config-eslint
* Merge pull request [#39](https://github.com/dyrector-io/dyrectorio/issues/39) from dyrector-io/fix/agent-version-space
* Merge pull request [#38](https://github.com/dyrector-io/dyrectorio/issues/38) from dyrector-io/dependabot/npm_and_yarn/web/crux/terser-5.14.2
* Merge pull request [#33](https://github.com/dyrector-io/dyrectorio/issues/33) from dyrector-io/fix/small-fixes-and-npm-macos-m1
* Merge pull request [#30](https://github.com/dyrector-io/dyrectorio/issues/30) from dyrector-io/feat/conventional-linter
* Merge pull request [#29](https://github.com/dyrector-io/dyrectorio/issues/29) from dyrector-io/fix/add-security-readme
* Merge pull request [#31](https://github.com/dyrector-io/dyrectorio/issues/31) from dyrector-io/fix/readme-and-crux-postgres-url


<a name="0.0.1"></a>
## 0.0.1 (2022-07-15)

### Add

* tests for json, string in utils; fix: json in utils; fix: remove code duplications ([#22](https://github.com/dyrector-io/dyrectorio/issues/22))

### Ci

* agent pipeline with tests & signing ([#3](https://github.com/dyrector-io/dyrectorio/issues/3))
* add web-crux workflow
* add lint to auth, apply suggested linter changes
* add basic CI functions for frontend, backend, agent and auth services

### Clean

* Makefile cleanup, proto generation refactor

### Docs

* add comments to dev compose and registry v2 client

### Feat

* tagging
* docker cp http endpoint, single file upload ([#26](https://github.com/dyrector-io/dyrectorio/issues/26))
* tty containerconfig option ([#25](https://github.com/dyrector-io/dyrectorio/issues/25))
* improve readme based on review and remove some unused files
* add changelog generation
* add gitlab, github registry types feat: add organization prefix to hub registries fix: home link in team page fix: adding multiple images from different registries in the same batch
* enable registration refactor: remove gitlab ci files
* add default readmes
* add github workflow structure to the project

### Feat

* add container signing

### Fix

* captcha sitekey during build
* ui recaptcha sitekey
* missing recaptcha key
* web-kratos pipeline permission
* web-kratos pipeline
* svg illustrations ([#21](https://github.com/dyrector-io/dyrectorio/issues/21))
* crux-ui pipeline
* crux-ui docker image building, crux-ui image sign in gh actions ([#17](https://github.com/dyrector-io/dyrectorio/issues/17))
* loading indicator image alt
* fix kratos admin url and add launch.json
* container registry path, crux-ui ci image building([#15](https://github.com/dyrector-io/dyrectorio/issues/15))
* repair the dagent install script in MacOS
* add none as default network mode on images
* remove unused env variables
* image search in v2 registries fix: wrong ts-proto version feat: update nestjs

### Improve

* add quick start to general readme

### Initial

* merged repositories into a public one

### Refactor

* merge auth ui into ui ([#20](https://github.com/dyrector-io/dyrectorio/issues/20))
* ui eslint dirs and errors

### Merge Requests

* Merge pull request [#18](https://github.com/dyrector-io/dyrectorio/issues/18) from dyrector-io/feat/add-changelog-generation
* Merge pull request [#14](https://github.com/dyrector-io/dyrectorio/issues/14) from dyrector-io/refactor/ui_eslint_errors
* Merge pull request [#16](https://github.com/dyrector-io/dyrectorio/issues/16) from dyrector-io/fix/fix-kratos-admin-url
* Merge pull request [#13](https://github.com/dyrector-io/dyrectorio/issues/13) from dyrector-io/feat/additional_registry_types
* Merge pull request [#11](https://github.com/dyrector-io/dyrectorio/issues/11) from dyrector-io/fix/repair-macos-dagent--script
* Merge pull request [#10](https://github.com/dyrector-io/dyrectorio/issues/10) from dyrector-io/fix/add-none-as-defult-networkmode
* Merge pull request [#9](https://github.com/dyrector-io/dyrectorio/issues/9) from dyrector-io/fix/improve-general-readme
* Merge pull request [#8](https://github.com/dyrector-io/dyrectorio/issues/8) from dyrector-io/fix/improve-env-examples
* Merge pull request [#7](https://github.com/dyrector-io/dyrectorio/issues/7) from dyrector-io/fix/crx-267_registry_v2_image_search_limit
* Merge pull request [#2](https://github.com/dyrector-io/dyrectorio/issues/2) from dyrector-io/ci/extend-web-auth
* Merge pull request [#1](https://github.com/dyrector-io/dyrectorio/issues/1) from dyrector-io/ci/add_basic_ci_functionality

