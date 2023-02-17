# CHANGELOG


<a name="0.3.4"></a>
## [0.3.4](https://github.com/dyrector-io/dyrectorio/compare/0.3.3...0.3.4) (2023-02-17)

### Feat

* add demo video ([#474](https://github.com/dyrector-io/dyrectorio/issues/474))
* add technology labels to templates ([#472](https://github.com/dyrector-io/dyrectorio/issues/472))

### Fix

* **(crux):** remove gitea ssh port until smarter traefik usage ([#475](https://github.com/dyrector-io/dyrectorio/issues/475))
* add release bump to package-lock.json ([#473](https://github.com/dyrector-io/dyrectorio/issues/473))
* dagent update self container id & ui updating status ([#471](https://github.com/dyrector-io/dyrectorio/issues/471))
* rename rw to rwo globally, need to migrate DB ([#470](https://github.com/dyrector-io/dyrectorio/issues/470))
* **(crux):** various fixes and refinements of templates ([#469](https://github.com/dyrector-io/dyrectorio/issues/469))


<a name="0.3.3"></a>
## [0.3.3](https://github.com/dyrector-io/dyrectorio/compare/0.3.2...0.3.3) (2023-02-16)

### Chore

* obsolete typo
* bump alpine-proto image and go-version, everywhere! ([#445](https://github.com/dyrector-io/dyrectorio/issues/445))
* **(ci):** update build images, upgrade to zstd ([#440](https://github.com/dyrector-io/dyrectorio/issues/440))

### Feat

* **(crux):** cal.com template ([#457](https://github.com/dyrector-io/dyrectorio/issues/457))
* **(cli):** add welcome message ([#458](https://github.com/dyrector-io/dyrectorio/issues/458))
* **(cli):** compose labels ([#462](https://github.com/dyrector-io/dyrectorio/issues/462))
* moved templates to assets, added email/notification templating ([#454](https://github.com/dyrector-io/dyrectorio/issues/454))
* **(crux):** standard health check ([#455](https://github.com/dyrector-io/dyrectorio/issues/455))
* agent shutdown ([#453](https://github.com/dyrector-io/dyrectorio/issues/453))
* **(web):** initialize http rest api ([#451](https://github.com/dyrector-io/dyrectorio/issues/451))
* **(crux-ui):** image / instance config screen websocket editing ([#447](https://github.com/dyrector-io/dyrectorio/issues/447))
* add optional port binding, alter ui validation ([#444](https://github.com/dyrector-io/dyrectorio/issues/444))
* **(crux):** added 'unchecked' registry type ([#439](https://github.com/dyrector-io/dyrectorio/issues/439))
* traefik improvements ([#430](https://github.com/dyrector-io/dyrectorio/issues/430))
* container log ([#420](https://github.com/dyrector-io/dyrectorio/issues/420))
* **(ci):** add proto and playwright image builder ([#435](https://github.com/dyrector-io/dyrectorio/issues/435))
* **(crux):** add vaultwarden template ([#428](https://github.com/dyrector-io/dyrectorio/issues/428))
* **(ci):** add dockerhub as repo target during image push ([#434](https://github.com/dyrector-io/dyrectorio/issues/434))
* **(web):** install script type selector and PowerShell script ([#422](https://github.com/dyrector-io/dyrectorio/issues/422))
* **(agent):** add option to have unlimited CPU ([#425](https://github.com/dyrector-io/dyrectorio/issues/425))
* add minecraft server template ([#414](https://github.com/dyrector-io/dyrectorio/issues/414))
* **(agent):** add multi arch build targets ([#418](https://github.com/dyrector-io/dyrectorio/issues/418))

### Fix

* **(crux-ui):** add privacy to registry screen ([#465](https://github.com/dyrector-io/dyrectorio/issues/465))
* fix config mapping, default filters ([#464](https://github.com/dyrector-io/dyrectorio/issues/464))
* **(crux-ui):** container config volume ids, chips ([#460](https://github.com/dyrector-io/dyrectorio/issues/460))
* minor ui fixes & dagent image url parsing ([#456](https://github.com/dyrector-io/dyrectorio/issues/456))
* save merged config & teams user list ([#452](https://github.com/dyrector-io/dyrectorio/issues/452))
* **(web):** version and deployment patch editing ([#459](https://github.com/dyrector-io/dyrectorio/issues/459))
* **(crux-ui):** minor config fixes ([#450](https://github.com/dyrector-io/dyrectorio/issues/450))
* **(crux):** clean & correct labels for vaultwarden ([#448](https://github.com/dyrector-io/dyrectorio/issues/448))
* **(agent):** logging fixes ([#442](https://github.com/dyrector-io/dyrectorio/issues/442))
* **(crux):** fixed powershell data mount path & install one liner ([#441](https://github.com/dyrector-io/dyrectorio/issues/441))
* **(ci):** image signing ([#438](https://github.com/dyrector-io/dyrectorio/issues/438))
* **(ci):** image signing ([#437](https://github.com/dyrector-io/dyrectorio/issues/437))
* **(crux-ui):** fix the expose strategy naming ([#436](https://github.com/dyrector-io/dyrectorio/issues/436))
* **(ci):** go push action missing command during docker load ([#433](https://github.com/dyrector-io/dyrectorio/issues/433))
* **(ci):** initalize an undefined variable ([#432](https://github.com/dyrector-io/dyrectorio/issues/432))
* **(ci):** conventional commits skip on non-PR runs ([#431](https://github.com/dyrector-io/dyrectorio/issues/431))
* **(crux-ui):** name creation ([#429](https://github.com/dyrector-io/dyrectorio/issues/429))
* **(web):** remove token revoke on node name change ([#427](https://github.com/dyrector-io/dyrectorio/issues/427))
* **(agent):** fix crane install manifest scripts ([#423](https://github.com/dyrector-io/dyrectorio/issues/423))
* **(crux-ui):** dyo list layout consistency ([#421](https://github.com/dyrector-io/dyrectorio/issues/421))
* template formik value update, scroll to the top and add images ([#419](https://github.com/dyrector-io/dyrectorio/issues/419))
* **(crux-ui):** json editor and mapper ([#413](https://github.com/dyrector-io/dyrectorio/issues/413))
* **(web):** deployment event order ([#416](https://github.com/dyrector-io/dyrectorio/issues/416))

### Refactor

* **(ci):** e2e testing ([#368](https://github.com/dyrector-io/dyrectorio/issues/368))
* **(web):** update kratos to v1.11 ([#401](https://github.com/dyrector-io/dyrectorio/issues/401))


<a name="0.3.2"></a>
## [0.3.2](https://github.com/dyrector-io/dyrectorio/compare/0.3.1...0.3.2) (2023-01-03)

### Feat

* add minecraft server template ([#414](https://github.com/dyrector-io/dyrectorio/issues/414))
* **(agent):** add multi arch build targets ([#418](https://github.com/dyrector-io/dyrectorio/issues/418))
* **(web):** add gitea template ([#412](https://github.com/dyrector-io/dyrectorio/issues/412))

### Fix

* **(crux-ui):** json editor and mapper ([#413](https://github.com/dyrector-io/dyrectorio/issues/413))
* **(web):** deployment event order ([#416](https://github.com/dyrector-io/dyrectorio/issues/416))


<a name="0.3.1"></a>
## [0.3.1](https://github.com/dyrector-io/dyrectorio/compare/0.3.0...0.3.1) (2022-12-22)

### Build

* **(web):** update web deps ([#393](https://github.com/dyrector-io/dyrectorio/issues/393))

### Feat

* **(crux-ui):** expand time label ([#411](https://github.com/dyrector-io/dyrectorio/issues/411))
* **(web):** template images ([#391](https://github.com/dyrector-io/dyrectorio/issues/391))
* **(crux-ui):** add form submit to ctrl+enter ([#395](https://github.com/dyrector-io/dyrectorio/issues/395))
* add LinkAce template ([#404](https://github.com/dyrector-io/dyrectorio/issues/404))
* **(crux):** reuse previous secrets ([#400](https://github.com/dyrector-io/dyrectorio/issues/400))
* **(agent):** distroless image, abs path support for mounts ([#402](https://github.com/dyrector-io/dyrectorio/issues/402))
* **(web):** prevent users from editing registry details ([#399](https://github.com/dyrector-io/dyrectorio/issues/399))
* **(agent):** container builder extra hosts ([#398](https://github.com/dyrector-io/dyrectorio/issues/398))
* **(web):** add dashboard ([#396](https://github.com/dyrector-io/dyrectorio/issues/396))
* **(web):** add wordpress template ([#388](https://github.com/dyrector-io/dyrectorio/issues/388))
* add self managed gitlab template ([#387](https://github.com/dyrector-io/dyrectorio/issues/387))

### Fix

* **(crux):** add missing secrets checl ([#410](https://github.com/dyrector-io/dyrectorio/issues/410))
* **(crux):** fix secret disappearance ([#407](https://github.com/dyrector-io/dyrectorio/issues/407))
* **(agent):** correct crane path manifests with distroless image ([#409](https://github.com/dyrector-io/dyrectorio/issues/409))
* openssl apline ([#406](https://github.com/dyrector-io/dyrectorio/issues/406))
* remove deprecated Prisma 'interactiveTransactions' ([#405](https://github.com/dyrector-io/dyrectorio/issues/405))
* **(web):** deployment and template fix ([#403](https://github.com/dyrector-io/dyrectorio/issues/403))
* self hosted gitlab releated issues ([#394](https://github.com/dyrector-io/dyrectorio/issues/394))
* **(crux-ui):** deployment deploy and log ([#392](https://github.com/dyrector-io/dyrectorio/issues/392))
* actualize readme, move helper package, fix small cli error ([#397](https://github.com/dyrector-io/dyrectorio/issues/397))
* **(agent):** handle expose with no ports ([#389](https://github.com/dyrector-io/dyrectorio/issues/389))

### Refactor

* anchor action remove ([#408](https://github.com/dyrector-io/dyrectorio/issues/408))
* **(crux-ui):** node persistent path ([#390](https://github.com/dyrector-io/dyrectorio/issues/390))


<a name="0.3.0"></a>
## [0.3.0](https://github.com/dyrector-io/dyrectorio/compare/0.2.2...0.3.0) (2022-12-06)

### Chore

* **(ci):** fix deprecated commands ([#365](https://github.com/dyrector-io/dyrectorio/issues/365))
* **(agent):** add missing setValue() docs ([#343](https://github.com/dyrector-io/dyrectorio/issues/343))
* **(agent):** change test variable to mock registry ([#338](https://github.com/dyrector-io/dyrectorio/issues/338))
* dead code and linter updates ([#333](https://github.com/dyrector-io/dyrectorio/issues/333))
* **(agent):** remove NodeID ([#328](https://github.com/dyrector-io/dyrectorio/issues/328))
* remove old flags small refactor ([#323](https://github.com/dyrector-io/dyrectorio/issues/323))
* goair for new watch tool and makefile modified ([#155](https://github.com/dyrector-io/dyrectorio/issues/155)) ([#309](https://github.com/dyrector-io/dyrectorio/issues/309))
* actualize vscode debug paths ([#298](https://github.com/dyrector-io/dyrectorio/issues/298))
* replaced all try-catch's with catch (err) ([#281](https://github.com/dyrector-io/dyrectorio/issues/281))
* fix broken CI - lint/security @ b5abab4 ([#252](https://github.com/dyrector-io/dyrectorio/issues/252))
* add codeowners to repository ([#255](https://github.com/dyrector-io/dyrectorio/issues/255))
* **(crux):** upgrade prisma client version to 4.4.0 ([#226](https://github.com/dyrector-io/dyrectorio/issues/226))
* remove outdated descriptions from README.mds ([#223](https://github.com/dyrector-io/dyrectorio/issues/223))

### Feat

* **(web):** prevent product and version delete ([#384](https://github.com/dyrector-io/dyrectorio/issues/384))
* **(agent):** add service monitor spawning ([#364](https://github.com/dyrector-io/dyrectorio/issues/364))
* container management ([#380](https://github.com/dyrector-io/dyrectorio/issues/380))
* **(crux-ui):** image reorder improvements ([#375](https://github.com/dyrector-io/dyrectorio/issues/375))
* added config editor to deployments page ([#329](https://github.com/dyrector-io/dyrectorio/issues/329))
* **(cli):** add ability to switch to localhost in the agent address environmental variable in crux ([#356](https://github.com/dyrector-io/dyrectorio/issues/356))
* **(agent):** dagent self update ([#321](https://github.com/dyrector-io/dyrectorio/issues/321))
* **(agent):** add registry authentication to crane ([#345](https://github.com/dyrector-io/dyrectorio/issues/345))
* **(web):** invite flow revamp ([#332](https://github.com/dyrector-io/dyrectorio/issues/332))
* **(crux):** add Prometheus basics ([#337](https://github.com/dyrector-io/dyrectorio/issues/337))
* **(crux-ui):** use next-link ([#324](https://github.com/dyrector-io/dyrectorio/issues/324))
* **(crux):** mingw64 support for dagent install script ([#325](https://github.com/dyrector-io/dyrectorio/issues/325))
* **(agent):** [#244](https://github.com/dyrector-io/dyrectorio/issues/244), crane init for private-key generate on k8s ([#293](https://github.com/dyrector-io/dyrectorio/issues/293))
* impelement labels & annotations ([#317](https://github.com/dyrector-io/dyrectorio/issues/317))
* **(web):** invalidate secrets ([#296](https://github.com/dyrector-io/dyrectorio/issues/296))
* **(crux-ui):** add websocket translation ([#316](https://github.com/dyrector-io/dyrectorio/issues/316))
* **(agent):** add new docker container builder attribute: shell ([#290](https://github.com/dyrector-io/dyrectorio/issues/290))
* **(crux):** add secrets to template ([#314](https://github.com/dyrector-io/dyrectorio/issues/314))
* **(web):** option to mark secrets as required ([#286](https://github.com/dyrector-io/dyrectorio/issues/286))
* **(agent):** [#245](https://github.com/dyrector-io/dyrectorio/issues/245), crane init at k8s deployment for shared secret ([#307](https://github.com/dyrector-io/dyrectorio/issues/307))
* go package single module for simplicity ([#305](https://github.com/dyrector-io/dyrectorio/issues/305))
* **(web):** create grc microservices template ([#308](https://github.com/dyrector-io/dyrectorio/issues/308))
* **(crux-ui):** add node connection card ([#304](https://github.com/dyrector-io/dyrectorio/issues/304))
* add container config page ([#297](https://github.com/dyrector-io/dyrectorio/issues/297))
* **(agent):** rework installscript to respect rootless/podman or otherwise different hosts; expose mailslurper smtpport ([#299](https://github.com/dyrector-io/dyrectorio/issues/299))
* **(agent):** silence containerbuilder's WithoutConflict func when container doesnt exists or running, only real errors will be printed ([#291](https://github.com/dyrector-io/dyrectorio/issues/291))
* product templates ([#243](https://github.com/dyrector-io/dyrectorio/issues/243))
* **(web):** copy deployment ([#259](https://github.com/dyrector-io/dyrectorio/issues/259))
* **(cli):** traefik port check ([#262](https://github.com/dyrector-io/dyrectorio/issues/262))
* **(crux-ui):** editor highlighting ([#260](https://github.com/dyrector-io/dyrectorio/issues/260))
* **(cli):** add traefik to cli ([#248](https://github.com/dyrector-io/dyrectorio/issues/248))
* **(crux-ui):** display never logged in ([#247](https://github.com/dyrector-io/dyrectorio/issues/247))
* introduce container exec builder to run exec command on container ([#230](https://github.com/dyrector-io/dyrectorio/issues/230))
* **(cli):** check open/duplicate port when fire up dyrectorio stack with cli ([#238](https://github.com/dyrector-io/dyrectorio/issues/238))
* **(crux-ui):** sensitive image config hint ([#212](https://github.com/dyrector-io/dyrectorio/issues/212))
* show secret status on deployment screen ([#198](https://github.com/dyrector-io/dyrectorio/issues/198))
* **(crux):** added config module ([#210](https://github.com/dyrector-io/dyrectorio/issues/210))
* **(web):** user default container list on deployment screen ([#211](https://github.com/dyrector-io/dyrectorio/issues/211))
* **(web):** handle different registry namespace ([#201](https://github.com/dyrector-io/dyrectorio/issues/201))
* **(crux-ui):** prettier format on windows ([#215](https://github.com/dyrector-io/dyrectorio/issues/215))
* **(cli):** check docker (and podman) requirements ([#197](https://github.com/dyrector-io/dyrectorio/issues/197))

### Fix

* increase playwright timeouts
* **(agent):** add crane deployment list all namespaces ([#386](https://github.com/dyrector-io/dyrectorio/issues/386))
* **(crux):** map deployment instance imageIds to new images when increasing version ([#382](https://github.com/dyrector-io/dyrectorio/issues/382))
* **(crux):** readd deploy notifications ([#383](https://github.com/dyrector-io/dyrectorio/issues/383))
* image mapper and docker install script ([#376](https://github.com/dyrector-io/dyrectorio/issues/376))
* **(crux-ui):** mutate swr cached node data ([#377](https://github.com/dyrector-io/dyrectorio/issues/377))
* **(web):** config mapping in deployment and version editing ([#371](https://github.com/dyrector-io/dyrectorio/issues/371))
* **(ci):** tag and version setting fix ([#369](https://github.com/dyrector-io/dyrectorio/issues/369))
* **(web):** multi prefix preparing deployment copy ([#370](https://github.com/dyrector-io/dyrectorio/issues/370))
* nullpointer while focusing an input without editor identity ([#367](https://github.com/dyrector-io/dyrectorio/issues/367))
* **(crux-ui):** revoke node script error & added template test ([#354](https://github.com/dyrector-io/dyrectorio/issues/354))
* **(crux):** active team template filter ([#366](https://github.com/dyrector-io/dyrectorio/issues/366))
* **(crux):** increase version fix ([#362](https://github.com/dyrector-io/dyrectorio/issues/362))
* **(crux-ui):** uncontrolled reacts errors ([#357](https://github.com/dyrector-io/dyrectorio/issues/357))
* **(web):** websocket routes ([#360](https://github.com/dyrector-io/dyrectorio/issues/360))
* **(cli):** crux agent address env var ([#353](https://github.com/dyrector-io/dyrectorio/issues/353))
* **(crux):** respect prefix after successful deployment ([#344](https://github.com/dyrector-io/dyrectorio/issues/344))
* **(web):** fix deployment mutability ([#350](https://github.com/dyrector-io/dyrectorio/issues/350))
* **(crux-ui):** registry field validator ([#349](https://github.com/dyrector-io/dyrectorio/issues/349))
* **(web):** create multiple preparing deployments to the same node with different prefixes ([#352](https://github.com/dyrector-io/dyrectorio/issues/352))
* **(crux):** move platform detection after priviledge escalation in install.docker.hbr ([#348](https://github.com/dyrector-io/dyrectorio/issues/348))
* **(crux):** increase version mapper fix ([#347](https://github.com/dyrector-io/dyrectorio/issues/347))
* dagent deployment and status streaming ([#346](https://github.com/dyrector-io/dyrectorio/issues/346))
* **(agent):** path updates ([#340](https://github.com/dyrector-io/dyrectorio/issues/340))
* **(crux-ui):** team name not refreshed on save ([#342](https://github.com/dyrector-io/dyrectorio/issues/342))
* **(crux-ui):** notification webhook regex ([#339](https://github.com/dyrector-io/dyrectorio/issues/339))
* add proto image missing binaries ([#335](https://github.com/dyrector-io/dyrectorio/issues/335))
* **(crux):** dagent install script on Ubuntu ([#334](https://github.com/dyrector-io/dyrectorio/issues/334))
* minor web fixes ([#330](https://github.com/dyrector-io/dyrectorio/issues/330))
* **(crux):** remove cert related code from Dockerfile ([#327](https://github.com/dyrector-io/dyrectorio/issues/327))
* traefik container start function ([#315](https://github.com/dyrector-io/dyrectorio/issues/315))
* **(crux):** fix copy deployment ([#312](https://github.com/dyrector-io/dyrectorio/issues/312))
* **(web):** copy deployment url & api ([#311](https://github.com/dyrector-io/dyrectorio/issues/311))
* **(crux):** image build
* port changes in webb and cli log improvement ([#303](https://github.com/dyrector-io/dyrectorio/issues/303))
* **(crux):** dagent install script container checks ([#301](https://github.com/dyrector-io/dyrectorio/issues/301))
* move pgp test into the correct folder ([#300](https://github.com/dyrector-io/dyrectorio/issues/300))
* **(agent):** remove comment and version strings from pgp keys, so tests will become deterministic
* **(ci):** missing PR trigger in golang.yml
* **(cli):** fix config dir creation
* **(cli):** traefik custom port
* **(cli):** add socket to configuration
* **(ci):** add pullrequest trigger to workflows
* **(crux-ui):** npm install target script ([#227](https://github.com/dyrector-io/dyrectorio/issues/227))
* **(agent):** lint errors ([#275](https://github.com/dyrector-io/dyrectorio/issues/275))
* **(crux-ui):** reset agent version after revoke ([#278](https://github.com/dyrector-io/dyrectorio/issues/278))
* **(crux-ui):** crux-ui pipeline ([#266](https://github.com/dyrector-io/dyrectorio/issues/266))
* update readme with cli changes, add addintional instructions ([#250](https://github.com/dyrector-io/dyrectorio/issues/250))
* **(crux-ui):** redirect to 404 when invalid invite ([#256](https://github.com/dyrector-io/dyrectorio/issues/256))
* setting secret value in newly installed node ([#253](https://github.com/dyrector-io/dyrectorio/issues/253))
* **(crux):** missing secrets from db seeder ([#231](https://github.com/dyrector-io/dyrectorio/issues/231))
* changelog generation regexp pattern ([#216](https://github.com/dyrector-io/dyrectorio/issues/216))
* container config path must be string instead of path ([#214](https://github.com/dyrector-io/dyrectorio/issues/214))

### Refactor

* changed grpc logging level (crux) and scroll deployment list (crux-ui) ([#372](https://github.com/dyrector-io/dyrectorio/issues/372))
* **(crux-ui):** refactor node management in e2e tests ([#358](https://github.com/dyrector-io/dyrectorio/issues/358))
* **(cli):** silence containercreation and rework logging ([#341](https://github.com/dyrector-io/dyrectorio/issues/341))
* **(crux):** remove db data seeders ([#336](https://github.com/dyrector-io/dyrectorio/issues/336))
* update proto default enum values ([#306](https://github.com/dyrector-io/dyrectorio/issues/306))
* **(agent):** JWT parsing & custom validation ([#280](https://github.com/dyrector-io/dyrectorio/issues/280))
* move go packages into one, extract CLI cmd ([#267](https://github.com/dyrector-io/dyrectorio/issues/267))
* **(cli):** use cleanenv for config ([#271](https://github.com/dyrector-io/dyrectorio/issues/271))
* **(crux-ui):** added registry & notifications tests ([#222](https://github.com/dyrector-io/dyrectorio/issues/222))
* **(crux):** use [@updatedAt](https://github.com/updatedAt) in prisma schema ([#225](https://github.com/dyrector-io/dyrectorio/issues/225))
* **(agent):** adding tests to agent ([#213](https://github.com/dyrector-io/dyrectorio/issues/213))


<a name="0.2.2"></a>
## [0.2.2](https://github.com/dyrector-io/dyrectorio/compare/0.2.1...0.2.2) (2022-10-10)

### Fix

* prisma segfault ([#254](https://github.com/dyrector-io/dyrectorio/issues/254))


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

### Doc

* setup steps & contributing gpg ([#35](https://github.com/dyrector-io/dyrectorio/issues/35))

### Feat

* k8s agent install, with manifests ([#43](https://github.com/dyrector-io/dyrectorio/issues/43))
* **(crux-ui):** font-family poppins ([#47](https://github.com/dyrector-io/dyrectorio/issues/47))
* **(crux-ui):** add type as tag to registry-card ([#41](https://github.com/dyrector-io/dyrectorio/issues/41))
* **(crux-ui):** page specific titles ([#37](https://github.com/dyrector-io/dyrectorio/issues/37))
* **(crux-ui):** add default registry image ([#36](https://github.com/dyrector-io/dyrectorio/issues/36))
* display agent version ([#28](https://github.com/dyrector-io/dyrectorio/issues/28))

### Fix

* **(agent):** swagger double init during testing ([#55](https://github.com/dyrector-io/dyrectorio/issues/55))
* **(crux-ui):** Auditlog Improvements ([#51](https://github.com/dyrector-io/dyrectorio/issues/51))
* proto makefile does not work on windows ([#52](https://github.com/dyrector-io/dyrectorio/issues/52))
* **(crux-ui):** layout and scaling on product card ([#46](https://github.com/dyrector-io/dyrectorio/issues/46))
* image edit websocket errors ([#44](https://github.com/dyrector-io/dyrectorio/issues/44))
* tsconfig parsing error in eslintrc
* **(agent):** agent version contains random space
* **(crux-ui):** recpatcha badge hides footer ([#34](https://github.com/dyrector-io/dyrectorio/issues/34))
* eslint errors, and apple silicon readme
* add pre-commit-linter and add CONTRIBUTING.md
* add security readme
* readme and crux `.env` configuration

### Refactor

* refactoring panic calls ([#53](https://github.com/dyrector-io/dyrectorio/issues/53))
* **(agent):** eliminated globals & lint fixes ([#48](https://github.com/dyrector-io/dyrectorio/issues/48))
* **(crux):** refactor email service ([#50](https://github.com/dyrector-io/dyrectorio/issues/50))
* **(crux):** use global interceptors ([#45](https://github.com/dyrector-io/dyrectorio/issues/45))
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

