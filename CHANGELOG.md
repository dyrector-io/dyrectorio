# CHANGELOG


<a name="v0.1.1"></a>
## [v0.1.1](https://github.com/dyrector-io/dyrectorio/compare/v0.1.0...v0.1.1) (2022-08-03)

### Chore

* clean README.mds & generate changelog ([#57](https://github.com/dyrector-io/dyrectorio/issues/57))

### Fix

* rename the install script files ([#63](https://github.com/dyrector-io/dyrectorio/issues/63))
* change the manifest paths ([#60](https://github.com/dyrector-io/dyrectorio/issues/60))


<a name="v0.1.0"></a>
## v0.1.0 (2022-08-01)

### Add

* tests for json, string in utils; fix: json in utils; fix: remove code duplications ([#22](https://github.com/dyrector-io/dyrectorio/issues/22))

### Chore

* contributing update, editorconfig and gitattributes

### Ci

* agent pipeline with tests & signing ([#3](https://github.com/dyrector-io/dyrectorio/issues/3))
* add web-crux workflow
* add lint to auth, apply suggested linter changes
* add basic CI functions for frontend, backend, agent and auth services

### Cicd

* added codecov

### Clean

* Makefile cleanup, proto generation refactor

### Doc

* setup steps & contributing gpg ([#35](https://github.com/dyrector-io/dyrectorio/issues/35))

### Docs

* add comments to dev compose and registry v2 client

### Feat

* k8s agent install, with manifests ([#43](https://github.com/dyrector-io/dyrectorio/issues/43))
* display agent version ([#28](https://github.com/dyrector-io/dyrectorio/issues/28))
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

* proto makefile does not work on windows ([#52](https://github.com/dyrector-io/dyrectorio/issues/52))
* image edit websocket errors ([#44](https://github.com/dyrector-io/dyrectorio/issues/44))
* tsconfig parsing error in eslintrc
* eslint errors, and apple silicon readme
* add pre-commit-linter and add CONTRIBUTING.md
* add security readme
* readme and crux `.env` configuration
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

### Improvement

* remove multiple choice from <DyoChips> component  ([#23](https://github.com/dyrector-io/dyrectorio/issues/23))

### Initial

* merged repositories into a public one

### Refactor

* refactoring panic calls ([#53](https://github.com/dyrector-io/dyrectorio/issues/53))
* Remove config module ([#40](https://github.com/dyrector-io/dyrectorio/issues/40))
* merge auth ui into ui ([#20](https://github.com/dyrector-io/dyrectorio/issues/20))
* ui eslint dirs and errors

### Merge Requests

* Merge pull request [#56](https://github.com/dyrector-io/dyrectorio/issues/56) from dyrector-io/chore/editorconfig-gitattributes
* Merge pull request [#42](https://github.com/dyrector-io/dyrectorio/issues/42) from dyrector-io/fix/ts-config-eslint
* Merge pull request [#39](https://github.com/dyrector-io/dyrectorio/issues/39) from dyrector-io/fix/agent-version-space
* Merge pull request [#38](https://github.com/dyrector-io/dyrectorio/issues/38) from dyrector-io/dependabot/npm_and_yarn/web/crux/terser-5.14.2
* Merge pull request [#33](https://github.com/dyrector-io/dyrectorio/issues/33) from dyrector-io/fix/small-fixes-and-npm-macos-m1
* Merge pull request [#30](https://github.com/dyrector-io/dyrectorio/issues/30) from dyrector-io/feat/conventional-linter
* Merge pull request [#29](https://github.com/dyrector-io/dyrectorio/issues/29) from dyrector-io/fix/add-security-readme
* Merge pull request [#31](https://github.com/dyrector-io/dyrectorio/issues/31) from dyrector-io/fix/readme-and-crux-postgres-url
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

