# CHANGELOG


<a name="0.2.2"></a>
## [0.2.2](https://github.com/dyrector-io/dyrectorio/compare/0.2.1...0.2.2) (2022-10-10)

### Fix

* use prisma's openssl binaries to workaround the segfault comming from different openssl versions

### Release

* 0.2.1 ([#204](https://github.com/dyrector-io/dyrectorio/issues/204))


<a name="0.2.1"></a>
## [0.2.1](https://github.com/dyrector-io/dyrectorio/compare/v0.1.1...0.2.1) (2022-09-27)

### Chore

* add cli to readme ([#176](https://github.com/dyrector-io/dyrectorio/issues/176))
* remove duplicated env and restructure for better readability ([#130](https://github.com/dyrector-io/dyrectorio/issues/130))
* add badges dark/light pictures and more documentation to README.md ([#123](https://github.com/dyrector-io/dyrectorio/issues/123))
* **(crux-ui):** remove outline in json editor ([#118](https://github.com/dyrector-io/dyrectorio/issues/118))
* json editor better caret color for visibility ([#108](https://github.com/dyrector-io/dyrectorio/issues/108))

### Doc

* remove gitbook content from this repository ([#150](https://github.com/dyrector-io/dyrectorio/issues/150))
* extend user facing docs  ([#127](https://github.com/dyrector-io/dyrectorio/issues/127))
* add user facing docs ([#106](https://github.com/dyrector-io/dyrectorio/issues/106))

### Feat

* **(crux-ui):** add chip filters ([#199](https://github.com/dyrector-io/dyrectorio/issues/199))
* **(web):** products & deployment details list view ([#200](https://github.com/dyrector-io/dyrectorio/issues/200))
* **(web):** list view for version images ([#194](https://github.com/dyrector-io/dyrectorio/issues/194))
* **(web):** server side filtering on audit log ([#196](https://github.com/dyrector-io/dyrectorio/issues/196))
* **(web):** added root path to agent script ([#195](https://github.com/dyrector-io/dyrectorio/issues/195))
* add make release
* **(web):** registry delete check & toast ([#179](https://github.com/dyrector-io/dyrectorio/issues/179))
* **(crux-ui):** add default changelog message ([#173](https://github.com/dyrector-io/dyrectorio/issues/173))
* add init-containers to crane ([#169](https://github.com/dyrector-io/dyrectorio/issues/169))
* **(web):** removed deployment name ([#161](https://github.com/dyrector-io/dyrectorio/issues/161))
* add secret volume to k8s manifests ([#170](https://github.com/dyrector-io/dyrectorio/issues/170))
* **(crux-ui):** change registry url error ([#164](https://github.com/dyrector-io/dyrectorio/issues/164))
* **(crux-ui):** add node status filter ([#162](https://github.com/dyrector-io/dyrectorio/issues/162))
* secrets ([#153](https://github.com/dyrector-io/dyrectorio/issues/153))
* **(agent):** add wait until into builder ([#154](https://github.com/dyrector-io/dyrectorio/issues/154))
* **(web):** audit log show email ([#147](https://github.com/dyrector-io/dyrectorio/issues/147))
* **(web):** notification settings ([#142](https://github.com/dyrector-io/dyrectorio/issues/142))
* **(web):** add last login column to team users table ([#141](https://github.com/dyrector-io/dyrectorio/issues/141))
* add networks to agent ([#135](https://github.com/dyrector-io/dyrectorio/issues/135))
* updated ts-proto ([#138](https://github.com/dyrector-io/dyrectorio/issues/138))
* **(web):** rework deployment screen ([#131](https://github.com/dyrector-io/dyrectorio/issues/131))
* **(web):** notification settings ([#126](https://github.com/dyrector-io/dyrectorio/issues/126))
* **(crux):** add local network option to dagent install script generation ([#137](https://github.com/dyrector-io/dyrectorio/issues/137))
* **(crux-ui):** no data to display notices ([#132](https://github.com/dyrector-io/dyrectorio/issues/132))
* **(crux-ui):** product & version type selector chips ([#134](https://github.com/dyrector-io/dyrectorio/issues/134))
* **(web):** default product rework ([#120](https://github.com/dyrector-io/dyrectorio/issues/120))
* **(agent):** remove unused code ([#117](https://github.com/dyrector-io/dyrectorio/issues/117))
* extend container config ([#109](https://github.com/dyrector-io/dyrectorio/issues/109))
* **(crux-ui):** adding links to deployment list ([#112](https://github.com/dyrector-io/dyrectorio/issues/112))
* replace nginx with traefik ([#107](https://github.com/dyrector-io/dyrectorio/issues/107))
* **(agent):** container builder network aliases ([#99](https://github.com/dyrector-io/dyrectorio/issues/99))
* **(crux-ui):** separate status page from page 500 ([#98](https://github.com/dyrector-io/dyrectorio/issues/98))
* **(crux-ui):** show versions on product edit ([#90](https://github.com/dyrector-io/dyrectorio/issues/90))
* **(web):** add deployment list page ([#88](https://github.com/dyrector-io/dyrectorio/issues/88))
* add env var for disable recaptcha
* team rework ([#79](https://github.com/dyrector-io/dyrectorio/issues/79))
* **(crux):** add notifications ([#80](https://github.com/dyrector-io/dyrectorio/issues/80))
* add container prefix, add createnetwork to traefik ([#75](https://github.com/dyrector-io/dyrectorio/issues/75))
* add gcr demo seeder ([#67](https://github.com/dyrector-io/dyrectorio/issues/67))
* pagination in auditlog ([#72](https://github.com/dyrector-io/dyrectorio/issues/72))
* implement google container registry ([#62](https://github.com/dyrector-io/dyrectorio/issues/62))
* DatePicker, DateRangeFilter, AuditLog filters ([#58](https://github.com/dyrector-io/dyrectorio/issues/58))

### Fix

* check directory for secret keys ([#203](https://github.com/dyrector-io/dyrectorio/issues/203))
* **(crux):** fix collecting child version ids ([#202](https://github.com/dyrector-io/dyrectorio/issues/202))
* add spacing, change branch name
* cli versioning, make version package public
* remove v prefix from versioning
* change the mac folder and typo in env ([#193](https://github.com/dyrector-io/dyrectorio/issues/193))
* **(crux-ui):** docker api rate limit ([#188](https://github.com/dyrector-io/dyrectorio/issues/188))
* **(crux-ui):** node tooltip ([#191](https://github.com/dyrector-io/dyrectorio/issues/191))
* **(crux-ui):** date inconsistency ([#190](https://github.com/dyrector-io/dyrectorio/issues/190))
* **(crux-ui):** fix ws connection subscribing ([#185](https://github.com/dyrector-io/dyrectorio/issues/185))
* **(crux-ui):** use regex on deployment prefix validation ([#186](https://github.com/dyrector-io/dyrectorio/issues/186))
* **(ci):** crux-ui image build ([#187](https://github.com/dyrector-io/dyrectorio/issues/187))
* **(crux-ui):** Console errors related to nextjs 12's webpack-hmr ([#184](https://github.com/dyrector-io/dyrectorio/issues/184))
* **(crux-ui):** image card ui improvement ([#181](https://github.com/dyrector-io/dyrectorio/issues/181))
* next startup error ([#182](https://github.com/dyrector-io/dyrectorio/issues/182))
* **(web):** restrict deployment creation without images ([#183](https://github.com/dyrector-io/dyrectorio/issues/183))
* **(crux-ui):** fix user role update ([#180](https://github.com/dyrector-io/dyrectorio/issues/180))
* **(crux):** remove parent versionmutability check when increase version ([#177](https://github.com/dyrector-io/dyrectorio/issues/177))
* deploying on unreachable node ([#178](https://github.com/dyrector-io/dyrectorio/issues/178))
* **(crux-ui):** move toaster to app component ([#175](https://github.com/dyrector-io/dyrectorio/issues/175))
* **(crux-ui):** fixed drag-and-drop highlight & drop position ([#167](https://github.com/dyrector-io/dyrectorio/issues/167))
* **(crux-ui):** trim product name ([#171](https://github.com/dyrector-io/dyrectorio/issues/171))
* **(crux-ui):** fix padding on table on audit-log ([#172](https://github.com/dyrector-io/dyrectorio/issues/172))
* **(crux-ui):** fix missing margin when adding image/deployment to simple product ([#174](https://github.com/dyrector-io/dyrectorio/issues/174))
* add secrets attr to demo seeder ([#166](https://github.com/dyrector-io/dyrectorio/issues/166))
* **(crux-ui):** version semantic hint ([#168](https://github.com/dyrector-io/dyrectorio/issues/168))
* **(crux-ui):** added min width to dialog ([#165](https://github.com/dyrector-io/dyrectorio/issues/165))
* **(crux-ui):** auditlog datefilter ([#163](https://github.com/dyrector-io/dyrectorio/issues/163))
* **(agent):** extra key validation added  ([#160](https://github.com/dyrector-io/dyrectorio/issues/160))
* **(web):** deployment improvements ([#159](https://github.com/dyrector-io/dyrectorio/issues/159))
* primsa containerConfig defaults and dagent envs ([#158](https://github.com/dyrector-io/dyrectorio/issues/158))
* **(agent):** container length check ([#157](https://github.com/dyrector-io/dyrectorio/issues/157))
* **(agent):** fix create network ([#156](https://github.com/dyrector-io/dyrectorio/issues/156))
* **(agent):** dagent network creation condition corrected ([#155](https://github.com/dyrector-io/dyrectorio/issues/155))
* **(agent):** use regex on container listing ([#152](https://github.com/dyrector-io/dyrectorio/issues/152))
* **(crux-ui):** active menu and paddings fixes ([#148](https://github.com/dyrector-io/dyrectorio/issues/148))
* **(crux):** fix deployment log ([#149](https://github.com/dyrector-io/dyrectorio/issues/149))
* **(crux-ui):**  edit image card overflow-x ([#144](https://github.com/dyrector-io/dyrectorio/issues/144))
* **(crux-ui):** node edit after save ([#146](https://github.com/dyrector-io/dyrectorio/issues/146))
* **(crux-ui):** auditlog table and modal layout ([#139](https://github.com/dyrector-io/dyrectorio/issues/139))
* **(crux-ui):** add active menu, change favicon ([#133](https://github.com/dyrector-io/dyrectorio/issues/133))
* **(crux-ui):** clear registry fields on type change ([#128](https://github.com/dyrector-io/dyrectorio/issues/128))
* **(crux-ui):** transform empty strings to undefined ([#119](https://github.com/dyrector-io/dyrectorio/issues/119))
* **(crux-ui):** UI glitches ([#122](https://github.com/dyrector-io/dyrectorio/issues/122))
* **(crux-ui):** white error toast ([#124](https://github.com/dyrector-io/dyrectorio/issues/124))
* restrict name text length ([#121](https://github.com/dyrector-io/dyrectorio/issues/121))
* **(crux-ui):** fixed deployment edit ([#114](https://github.com/dyrector-io/dyrectorio/issues/114))
* **(crux-ui):** node setup script improvement ([#116](https://github.com/dyrector-io/dyrectorio/issues/116))
* multiple ui fixes ([#102](https://github.com/dyrector-io/dyrectorio/issues/102))
* **(agent):** image pull throttle, package updates, style ([#111](https://github.com/dyrector-io/dyrectorio/issues/111))
* **(agent):** added image name/tag to grpc status ([#110](https://github.com/dyrector-io/dyrectorio/issues/110))
* json editor scrolling ([#104](https://github.com/dyrector-io/dyrectorio/issues/104))
* **(crux-ui):** text overflow ([#97](https://github.com/dyrector-io/dyrectorio/issues/97))
* useWebSocket hook & provider ([#93](https://github.com/dyrector-io/dyrectorio/issues/93))
* i18n improvement & remove unused type import & eslintrc vscode fix ([#101](https://github.com/dyrector-io/dyrectorio/issues/101))
* **(crux):** run npm install to fix the lockfile missmatch
* **(crux-ui):** change the deployments sidebar icon ([#96](https://github.com/dyrector-io/dyrectorio/issues/96))
* deploy registry URL ([#95](https://github.com/dyrector-io/dyrectorio/issues/95))
* **(crux-ui):** update discord validation regex ([#94](https://github.com/dyrector-io/dyrectorio/issues/94))
* **(crux-ui):** add diff box-shadow and improve minor stylistic issues ([#92](https://github.com/dyrector-io/dyrectorio/issues/92))
* deployment not moving to in-progress ([#89](https://github.com/dyrector-io/dyrectorio/issues/89))
* **(crux-ui):** add notification url validation ([#91](https://github.com/dyrector-io/dyrectorio/issues/91))
* **(ci):** add protobuffjs to crux and upgrade to 18.7 node
* **(ci):** put back nestjs/cli to dependencies ([#86](https://github.com/dyrector-io/dyrectorio/issues/86))
* **(crux-ui):** map versions on new default version ([#83](https://github.com/dyrector-io/dyrectorio/issues/83))
* **(agent):** grpc network mode not mapped ([#82](https://github.com/dyrector-io/dyrectorio/issues/82))
* **(agent):** pull image if it does not exist ([#74](https://github.com/dyrector-io/dyrectorio/issues/74))
* missing locales ([#77](https://github.com/dyrector-io/dyrectorio/issues/77))
* node card content ([#78](https://github.com/dyrector-io/dyrectorio/issues/78))
* **(crux):** Upgrade Prisma and NestJS ([#70](https://github.com/dyrector-io/dyrectorio/issues/70))
* **(agent):** crash if container creation failed ([#73](https://github.com/dyrector-io/dyrectorio/issues/73))

### Refactor

* split models and validation file ([#192](https://github.com/dyrector-io/dyrectorio/issues/192))
* **(crux):** extend eslint ([#145](https://github.com/dyrector-io/dyrectorio/issues/145))
* remove circular dependency from registryConnections ([#143](https://github.com/dyrector-io/dyrectorio/issues/143))
* **(crux-ui):** extend eslint ([#136](https://github.com/dyrector-io/dyrectorio/issues/136))
* **(crux):** refactored deprecated prisma function ([#81](https://github.com/dyrector-io/dyrectorio/issues/81))
* runtime recaptcha site key env ([#85](https://github.com/dyrector-io/dyrectorio/issues/85))
* **(crux):** urlPrefix to imageNamePrefix ([#84](https://github.com/dyrector-io/dyrectorio/issues/84))
* make state and status name usage consistent ([#71](https://github.com/dyrector-io/dyrectorio/issues/71))
* **(agent):** handle k8s resource parsing errors ([#76](https://github.com/dyrector-io/dyrectorio/issues/76))
* **(agent):** context usage ([#68](https://github.com/dyrector-io/dyrectorio/issues/68))
* **(agent):** move container builder to package ([#65](https://github.com/dyrector-io/dyrectorio/issues/65))
* **(agent):** moved crane/dagent errors to v1 ([#66](https://github.com/dyrector-io/dyrectorio/issues/66))
* **(agent):** gRPC communication with core ([#61](https://github.com/dyrector-io/dyrectorio/issues/61))
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

### Refactor

* **(agent):** tests ([#54](https://github.com/dyrector-io/dyrectorio/issues/54))


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

