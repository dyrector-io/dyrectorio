# CHANGELOG


<a name="0.10.0"></a>
## [0.10.0](https://github.com/dyrector-io/dyrectorio/compare/0.9.0...0.10.0) (2023-12-04)

### Chore

* remove deprecated development environment files ([#875](https://github.com/dyrector-io/dyrectorio/issues/875))

### Feat

* **(crux-ui):** password show icon ([#882](https://github.com/dyrector-io/dyrectorio/issues/882))
* **(web):** integrates the mattermost webhook to notifications ([#877](https://github.com/dyrector-io/dyrectorio/issues/877))
* add docs link to the top page of readme ([#883](https://github.com/dyrector-io/dyrectorio/issues/883))
* **(web):** add private docker hub registry support ([#884](https://github.com/dyrector-io/dyrectorio/issues/884))
* **(web):** quality assurance ([#874](https://github.com/dyrector-io/dyrectorio/issues/874))
* add working directory to container config ([#879](https://github.com/dyrector-io/dyrectorio/issues/879))
* **(web):** integrate rocket.chat ([#867](https://github.com/dyrector-io/dyrectorio/issues/867))
* node kick & updated agent connection kick fix & fallback token ([#870](https://github.com/dyrector-io/dyrectorio/issues/870))

### Fix

* **(crux-ui):** sidebar vertical grow ([#880](https://github.com/dyrector-io/dyrectorio/issues/880))
* deploy event race ([#872](https://github.com/dyrector-io/dyrectorio/issues/872))
* **(web):** change command and arg validation ([#871](https://github.com/dyrector-io/dyrectorio/issues/871))
* **(crux-ui):** recovery captcha ([#868](https://github.com/dyrector-io/dyrectorio/issues/868))

### Refactor

* **(crux-ui):** title hrefs ([#888](https://github.com/dyrector-io/dyrectorio/issues/888))
* **(crux-ui):** password component


<a name="0.9.0"></a>
## [0.9.0](https://github.com/dyrector-io/dyrectorio/compare/0.8.2...0.9.0) (2023-10-20)

### Doc

* Update README.mds [#827](https://github.com/dyrector-io/dyrectorio/issues/827) ([#855](https://github.com/dyrector-io/dyrectorio/issues/855))
* improve-readme-and-contributing-files ([#845](https://github.com/dyrector-io/dyrectorio/issues/845))
* update development.md, maintainers.md and security.md ([#844](https://github.com/dyrector-io/dyrectorio/issues/844))
* add ADOPTERS.md to the project ([#835](https://github.com/dyrector-io/dyrectorio/issues/835))
* updates the contributing.md file ([#805](https://github.com/dyrector-io/dyrectorio/issues/805))

### Feat

* node type based container config fields ([#862](https://github.com/dyrector-io/dyrectorio/issues/862))
* agent image pull progress, early log fix, agent log level ([#861](https://github.com/dyrector-io/dyrectorio/issues/861))
* **(ci):** optimize github workflow for non-code changes ([#833](https://github.com/dyrector-io/dyrectorio/issues/833))
* **(crux-ui):** DyoTable component ([#830](https://github.com/dyrector-io/dyrectorio/issues/830))
* **(crux-ui):** add unit test for registry yup validation ([#850](https://github.com/dyrector-io/dyrectorio/issues/850))
* inspect container ([#841](https://github.com/dyrector-io/dyrectorio/issues/841))

### Fix

* unique key value input error message updates ([#860](https://github.com/dyrector-io/dyrectorio/issues/860))
* **(crux):** audit event filter ([#856](https://github.com/dyrector-io/dyrectorio/issues/856))
* unnecessary websocket error toasts ([#858](https://github.com/dyrector-io/dyrectorio/issues/858))
* identity listing ([#857](https://github.com/dyrector-io/dyrectorio/issues/857))
* **(crux-ui):** submit hook ([#816](https://github.com/dyrector-io/dyrectorio/issues/816))
* **(agent):** add capital image name handling ([#848](https://github.com/dyrector-io/dyrectorio/issues/848))

### Refactor

* internal/helper/image_unit_test : use table driven tests ([#838](https://github.com/dyrector-io/dyrectorio/issues/838))


<a name="0.8.2"></a>
## [0.8.2](https://github.com/dyrector-io/dyrectorio/compare/0.8.1...0.8.2) (2023-09-25)

### Doc

* update development.md ([#821](https://github.com/dyrector-io/dyrectorio/issues/821))

### Feat

* **(web):** node deployment list ([#826](https://github.com/dyrector-io/dyrectorio/issues/826))
* **(web):** agent update button availability ([#822](https://github.com/dyrector-io/dyrectorio/issues/822))
* **(crux-ui):** yup localization ([#813](https://github.com/dyrector-io/dyrectorio/issues/813))

### Fix

* **(crux):** WS session expire cleanup ([#823](https://github.com/dyrector-io/dyrectorio/issues/823))
* copying a deployment now does not copies the secret values to a different node ([#828](https://github.com/dyrector-io/dyrectorio/issues/828))
* shorthash mismatch ([#825](https://github.com/dyrector-io/dyrectorio/issues/825))
* **(crux-ui):** versionless type tag not showing & update deployment uptime counters ([#824](https://github.com/dyrector-io/dyrectorio/issues/824))
* update env.examples ([#817](https://github.com/dyrector-io/dyrectorio/issues/817))
* kratos user list pagination ([#820](https://github.com/dyrector-io/dyrectorio/issues/820))
* **(crux):** legacy agent update ([#819](https://github.com/dyrector-io/dyrectorio/issues/819))
* **(agent):** crashing on install and connection token mismatch ([#815](https://github.com/dyrector-io/dyrectorio/issues/815))


<a name="0.8.1"></a>
## [0.8.1](https://github.com/dyrector-io/dyrectorio/compare/0.8.0...0.8.1) (2023-09-07)

### Doc

* update readme ([#802](https://github.com/dyrector-io/dyrectorio/issues/802))

### Feat

* add explicit port routing & go tools bump ([#808](https://github.com/dyrector-io/dyrectorio/issues/808))
* **(crux-ui):** useEffect submitRef update ([#806](https://github.com/dyrector-io/dyrectorio/issues/806))
* service category label for platform containers & hide containers based on category ([#807](https://github.com/dyrector-io/dyrectorio/issues/807))
* oneshot agent install tokens ([#796](https://github.com/dyrector-io/dyrectorio/issues/796))

### Fix

* **(crux):** floating promises ([#814](https://github.com/dyrector-io/dyrectorio/issues/814))
* missing translations in lists ([#811](https://github.com/dyrector-io/dyrectorio/issues/811))
* **(web):** validate container name duplication ([#812](https://github.com/dyrector-io/dyrectorio/issues/812))
* port range exposing and various bugfixes ([#809](https://github.com/dyrector-io/dyrectorio/issues/809))
* **(ci):** fix the trailing whitespace error ([#804](https://github.com/dyrector-io/dyrectorio/issues/804))

### Refactor

* **(web):** optimize ws client routing ([#810](https://github.com/dyrector-io/dyrectorio/issues/810))


<a name="0.8.0"></a>
## [0.8.0](https://github.com/dyrector-io/dyrectorio/compare/0.7.0...0.8.0) (2023-08-31)

### Chore

* readme styling ([#794](https://github.com/dyrector-io/dyrectorio/issues/794))
* **(crux):** fix vm2 critical vuln using npm audit fix ([#793](https://github.com/dyrector-io/dyrectorio/issues/793))

### Doc

* update readme ([#787](https://github.com/dyrector-io/dyrectorio/issues/787))

### Feat

* **(web):** crane metrics config ([#797](https://github.com/dyrector-io/dyrectorio/issues/797))
* **(web):** config bundles ([#788](https://github.com/dyrector-io/dyrectorio/issues/788))
* **(crux-ui):** add sorting to tables ([#798](https://github.com/dyrector-io/dyrectorio/issues/798))
* **(crux-ui):** image list on registry page ([#791](https://github.com/dyrector-io/dyrectorio/issues/791))
* **(crux):** add mlops template ([#792](https://github.com/dyrector-io/dyrectorio/issues/792))
* **(web):** protected deployment ([#781](https://github.com/dyrector-io/dyrectorio/issues/781))
* **(crux-ui):** separate image and instance config buttons ([#790](https://github.com/dyrector-io/dyrectorio/issues/790))
* **(crux-ui):** deployment page create card ([#782](https://github.com/dyrector-io/dyrectorio/issues/782))
* **(crux):** moved metric endpoint to other port ([#780](https://github.com/dyrector-io/dyrectorio/issues/780))

### Fix

* **(crux-ui):** register and team card validation ([#784](https://github.com/dyrector-io/dyrectorio/issues/784))
* **(crux-ui):** image config error text ([#789](https://github.com/dyrector-io/dyrectorio/issues/789))
* **(crux):** teamslug param for docs ([#783](https://github.com/dyrector-io/dyrectorio/issues/783))
* **(crux):** notification webhook test ([#774](https://github.com/dyrector-io/dyrectorio/issues/774))
* container builder image priority ([#779](https://github.com/dyrector-io/dyrectorio/issues/779))


<a name="0.7.0"></a>
## [0.7.0](https://github.com/dyrector-io/dyrectorio/compare/0.6.1...0.7.0) (2023-08-08)

### Chore

* **(web):** update node packages ([#778](https://github.com/dyrector-io/dyrectorio/issues/778))
* new export dyrectorio offline bundle ([#776](https://github.com/dyrector-io/dyrectorio/issues/776))

### Doc

* add GETTING_STARTED.md, small section rewrites ([#768](https://github.com/dyrector-io/dyrectorio/issues/768))

### Feat

* **(crux-ui):** save view mode for projects, deployment state, version state pages ([#772](https://github.com/dyrector-io/dyrectorio/issues/772))
* **(web):** updated Kratos to v1.0 ([#771](https://github.com/dyrector-io/dyrectorio/issues/771))
* **(web):** add team slug ([#752](https://github.com/dyrector-io/dyrectorio/issues/752))
* **(agent):** dagent ipc health ([#765](https://github.com/dyrector-io/dyrectorio/issues/765))
* add HEALTHCHECK directives to every platform image ([#767](https://github.com/dyrector-io/dyrectorio/issues/767))
* **(web):** node in use ([#763](https://github.com/dyrector-io/dyrectorio/issues/763))
* **(web):** deployment patch prefix error & fixed json editor kubernetes labels ([#759](https://github.com/dyrector-io/dyrectorio/issues/759))
* rename ingress to routing in container config ([#749](https://github.com/dyrector-io/dyrectorio/issues/749))
* **(crux-ui):** leave team ([#748](https://github.com/dyrector-io/dyrectorio/issues/748))

### Fix

* container list watching with multiple users ([#777](https://github.com/dyrector-io/dyrectorio/issues/777))
* **(web):** docker log config default value ([#766](https://github.com/dyrector-io/dyrectorio/issues/766))
* **(crux-ui):** kratos oidc missing info ([#773](https://github.com/dyrector-io/dyrectorio/issues/773))
* **(web):** config validation & project version number & dagent correct image log ([#764](https://github.com/dyrector-io/dyrectorio/issues/764))
* **(crux-ui):** project name filter ([#754](https://github.com/dyrector-io/dyrectorio/issues/754))
* improve release makefile command and update modules ([#755](https://github.com/dyrector-io/dyrectorio/issues/755))
* **(crux-ui):** change rolling version deployment error to warning ([#751](https://github.com/dyrector-io/dyrectorio/issues/751))
* **(crux):** prisma error handling & team user delete ([#746](https://github.com/dyrector-io/dyrectorio/issues/746))

### Refactor

* **(crux-ui):** useConfirmation ([#761](https://github.com/dyrector-io/dyrectorio/issues/761))
* **(web):** rename container status to container state ([#760](https://github.com/dyrector-io/dyrectorio/issues/760))


<a name="0.6.1"></a>
## [0.6.1](https://github.com/dyrector-io/dyrectorio/compare/0.6.0...0.6.1) (2023-07-14)

### Fix

* failing deployment token migration ([#750](https://github.com/dyrector-io/dyrectorio/issues/750))
* none container logger & port validation & moved in use warnings ([#741](https://github.com/dyrector-io/dyrectorio/issues/741))
* **(ci):** fix the unrecognized error arround external deploy workflow ([#744](https://github.com/dyrector-io/dyrectorio/issues/744))
* **(crux-ui):** add view buttons to deployment list rows ([#743](https://github.com/dyrector-io/dyrectorio/issues/743))
* **(crux-ui):** change confirm button color ([#747](https://github.com/dyrector-io/dyrectorio/issues/747))


<a name="0.6.0"></a>
## [0.6.0](https://github.com/dyrector-io/dyrectorio/compare/0.5.5...0.6.0) (2023-07-12)

### Feat

* unchecked registry use local images ([#745](https://github.com/dyrector-io/dyrectorio/issues/745))

### Fix

* remove n refactor todos ([#742](https://github.com/dyrector-io/dyrectorio/issues/742))
* deployment token name validation ([#740](https://github.com/dyrector-io/dyrectorio/issues/740))


<a name="0.5.5"></a>
## [0.5.5](https://github.com/dyrector-io/dyrectorio/compare/0.5.4...0.5.5) (2023-07-10)

### Doc

* additional note for Playwright install ([#725](https://github.com/dyrector-io/dyrectorio/issues/725))
* clarified Development getting started ([#723](https://github.com/dyrector-io/dyrectorio/issues/723))

### Docs

* add branching strategy to CONTRIBUTING.md ([#715](https://github.com/dyrector-io/dyrectorio/issues/715))

### Feat

* add deployment token name ([#736](https://github.com/dyrector-io/dyrectorio/issues/736))
* **(crux-ui):** breadcrumb home icon ([#735](https://github.com/dyrector-io/dyrectorio/issues/735))
* use events to track container states in agents ([#718](https://github.com/dyrector-io/dyrectorio/issues/718))
* **(web):** websocket save indicator refinement ([#726](https://github.com/dyrector-io/dyrectorio/issues/726))
* **(web):** social sign-in ([#722](https://github.com/dyrector-io/dyrectorio/issues/722))
* **(crux-ui):** deployment table sorting ([#704](https://github.com/dyrector-io/dyrectorio/issues/704))
* **(web):** token never expiration ([#716](https://github.com/dyrector-io/dyrectorio/issues/716))
* **(web):** agent container command audit ([#711](https://github.com/dyrector-io/dyrectorio/issues/711))
* **(crux-ui):** web socket save indicator ([#710](https://github.com/dyrector-io/dyrectorio/issues/710))

### Fix

* **(crux):** remove unused ApiPreconditionFailedResponse import ([#739](https://github.com/dyrector-io/dyrectorio/issues/739))
* empty secret parsing & required secrets error ([#737](https://github.com/dyrector-io/dyrectorio/issues/737))
* **(web):** various ui fixes releated to onboarding, registration verification, deployment list ([#730](https://github.com/dyrector-io/dyrectorio/issues/730))
* **(agent):** change agent start directive from CMD to ENTRYPOINT ([#724](https://github.com/dyrector-io/dyrectorio/issues/724))
* **(crux-ui):** edit deployment ([#720](https://github.com/dyrector-io/dyrectorio/issues/720))
* **(crux):** http logger ([#719](https://github.com/dyrector-io/dyrectorio/issues/719))
* **(crux-ui):** unable to edit node ([#717](https://github.com/dyrector-io/dyrectorio/issues/717))
* **(web):** deploy image order & sendForm null headers ([#714](https://github.com/dyrector-io/dyrectorio/issues/714))
* CONTRIBUTING.md sync and pipeline cli image push fix ([#713](https://github.com/dyrector-io/dyrectorio/issues/713))

### Refactor

* **(crux):** error statuses for route handlers ([#738](https://github.com/dyrector-io/dyrectorio/issues/738))
* **(crux):** refactor HTTP response status codes for request handlers ([#733](https://github.com/dyrector-io/dyrectorio/issues/733))
* **(crux):** use [@updatedAt](https://github.com/updatedAt) without optional in prisma schema ([#728](https://github.com/dyrector-io/dyrectorio/issues/728))


<a name="0.5.4"></a>
## [0.5.4](https://github.com/dyrector-io/dyrectorio/compare/0.5.3...0.5.4) (2023-06-23)

### Feat

* **(crux-ui):** add delete button to deployments list ([#709](https://github.com/dyrector-io/dyrectorio/issues/709))
* **(web):** select instances to deploy ([#700](https://github.com/dyrector-io/dyrectorio/issues/700))
* **(web):** convert versionless project to versioned ([#705](https://github.com/dyrector-io/dyrectorio/issues/705))
* **(crux-ui):** reload on kratos gone ([#707](https://github.com/dyrector-io/dyrectorio/issues/707))
* **(web):** add deployment tokens ([#701](https://github.com/dyrector-io/dyrectorio/issues/701))
* **(web):** registry api errors ([#699](https://github.com/dyrector-io/dyrectorio/issues/699))

### Fix

* **(crux):** deployment deletes containers ([#703](https://github.com/dyrector-io/dyrectorio/issues/703))
* small improvements in makefile around bundle ([#702](https://github.com/dyrector-io/dyrectorio/issues/702))
* add crane to signer image and add additional cache restore ([#698](https://github.com/dyrector-io/dyrectorio/issues/698))


<a name="0.5.3"></a>
## [0.5.3](https://github.com/dyrector-io/dyrectorio/compare/0.5.2...0.5.3) (2023-06-16)

### Fix

* add crane to signer image and add additional cache restore ([#698](https://github.com/dyrector-io/dyrectorio/issues/698))


<a name="0.5.2"></a>
## [0.5.2](https://github.com/dyrector-io/dyrectorio/compare/0.5.1...0.5.2) (2023-06-16)

### Build

* reapply image signing using `crane cp` from gcr ([#692](https://github.com/dyrector-io/dyrectorio/issues/692))

### Ci

* add missing go_push requirement ([#695](https://github.com/dyrector-io/dyrectorio/issues/695))

### Feat

* **(web):** node install & container uptime & fail deployments on bootstrap ([#696](https://github.com/dyrector-io/dyrectorio/issues/696))
* **(crux-ui):** playwright project ([#691](https://github.com/dyrector-io/dyrectorio/issues/691))
* **(ci):** add caches ([#688](https://github.com/dyrector-io/dyrectorio/issues/688))

### Fix

* **(agent):** dagent registry auth ([#693](https://github.com/dyrector-io/dyrectorio/issues/693))


<a name="0.5.1"></a>
## [0.5.1](https://github.com/dyrector-io/dyrectorio/compare/0.5.0...0.5.1) (2023-06-14)

### Build

* include golang version change in release script ([#690](https://github.com/dyrector-io/dyrectorio/issues/690))

### Fix

* **(ci):** minor versioning with crux push ([#689](https://github.com/dyrector-io/dyrectorio/issues/689))


<a name="0.5.0"></a>
## [0.5.0](https://github.com/dyrector-io/dyrectorio/compare/0.4.2...0.5.0) (2023-06-14)

### Build

* remove signing from multiarch images ([#682](https://github.com/dyrector-io/dyrectorio/issues/682))
* **(agent):** fix multi-arch agent builds in GH actions ([#679](https://github.com/dyrector-io/dyrectorio/issues/679))
* add staging deploy workflow ([#672](https://github.com/dyrector-io/dyrectorio/issues/672))
* remove branch from release target ([#663](https://github.com/dyrector-io/dyrectorio/issues/663))
* add hardcoded agent and cli versions ([#648](https://github.com/dyrector-io/dyrectorio/issues/648))

### Chore

* **(ci):** split builder image ([#653](https://github.com/dyrector-io/dyrectorio/issues/653))
* **(crux-ui):** remove needless buildstep from dockerfile ([#616](https://github.com/dyrector-io/dyrectorio/issues/616))

### Docs

* Use the correct url for app.dyrectorio.com ([#641](https://github.com/dyrector-io/dyrectorio/issues/641))
* add back the how it works image ([#613](https://github.com/dyrector-io/dyrectorio/issues/613))

### Feat

* **(crux-ui):** add tooltips and refactor <Image> to <DyoIcon> ([#686](https://github.com/dyrector-io/dyrectorio/issues/686))
* **(web):** copy rolling deployment ([#684](https://github.com/dyrector-io/dyrectorio/issues/684))
* **(web):** add extra explanation to dagent persistence section ([#687](https://github.com/dyrector-io/dyrectorio/issues/687))
* **(crux-ui):** node script & add deployment & config json editor improvements ([#681](https://github.com/dyrector-io/dyrectorio/issues/681))
* **(ci):** add concurrency ([#685](https://github.com/dyrector-io/dyrectorio/issues/685))
* **(web):** agent audit log ([#666](https://github.com/dyrector-io/dyrectorio/issues/666))
* **(agent):** crane pod state mapping ([#637](https://github.com/dyrector-io/dyrectorio/issues/637))
* **(cli):** add CLI version in addition to runtime versions ([#668](https://github.com/dyrector-io/dyrectorio/issues/668))
* **(web):** onboarding ([#657](https://github.com/dyrector-io/dyrectorio/issues/657))
* **(web):** rename project type values ([#665](https://github.com/dyrector-io/dyrectorio/issues/665))
* **(cli):** better image pull display ([#584](https://github.com/dyrector-io/dyrectorio/issues/584))
* **(crux-ui):** config initial filters based on config ([#650](https://github.com/dyrector-io/dyrectorio/issues/650))
* change the version in version.go when using make release command ([#647](https://github.com/dyrector-io/dyrectorio/issues/647))
* **(ci):** minor versions will always point at the latest patchversion ([#646](https://github.com/dyrector-io/dyrectorio/issues/646))
* **(web):** improve audit log ([#642](https://github.com/dyrector-io/dyrectorio/issues/642))
* **(web):** outdated agent ([#640](https://github.com/dyrector-io/dyrectorio/issues/640))
* agent install version & version checking on connection & minor team selector fix ([#622](https://github.com/dyrector-io/dyrectorio/issues/622))
* **(crux):** use proxy headers to determine the node ip ([#635](https://github.com/dyrector-io/dyrectorio/issues/635))
* **(web):** add jest to ui and fix the container (internal) missleadings ([#619](https://github.com/dyrector-io/dyrectorio/issues/619))
* **(ci):** add auto assignes to PR ([#620](https://github.com/dyrector-io/dyrectorio/issues/620))
* **(ci):** add yamlfmt validation, update cosign ([#588](https://github.com/dyrector-io/dyrectorio/issues/588))
* append git short hash to crux and ui versions ([#598](https://github.com/dyrector-io/dyrectorio/issues/598))
* **(crux):** add pino logger, and small config refactors ([#594](https://github.com/dyrector-io/dyrectorio/issues/594))

### Fix

* **(web):** userId cannot be null in config screen ([#670](https://github.com/dyrector-io/dyrectorio/issues/670))
* **(web):** rolling version deployments ([#678](https://github.com/dyrector-io/dyrectorio/issues/678))
* project creation navigation, remove playwright retries, small fixes ([#680](https://github.com/dyrector-io/dyrectorio/issues/680))
* web socket reconnect throttle ([#675](https://github.com/dyrector-io/dyrectorio/issues/675))
* **(web):** deployment environment editing ([#676](https://github.com/dyrector-io/dyrectorio/issues/676))
* **(crux):** add https if protocol is missing from storage URL ([#674](https://github.com/dyrector-io/dyrectorio/issues/674))
* registry and storage editing ([#673](https://github.com/dyrector-io/dyrectorio/issues/673))
* registration and verification flows ([#671](https://github.com/dyrector-io/dyrectorio/issues/671))
* **(web):** rename field to make Traefik work again ([#667](https://github.com/dyrector-io/dyrectorio/issues/667))
* add multi-arch build for CLI and agents ([#658](https://github.com/dyrector-io/dyrectorio/issues/658))
* **(crux-ui):** add links to registries ([#662](https://github.com/dyrector-io/dyrectorio/issues/662))
* **(crux):** very old audit log migration ([#659](https://github.com/dyrector-io/dyrectorio/issues/659))
* **(crux-ui):** add node description to empty node screen ([#660](https://github.com/dyrector-io/dyrectorio/issues/660))
* **(ci):** fix the js and tsx source label rules ([#664](https://github.com/dyrector-io/dyrectorio/issues/664))
* **(web):** deployment list & install script & email verification ([#651](https://github.com/dyrector-io/dyrectorio/issues/651))
* **(crux):** add default for pino logger ([#652](https://github.com/dyrector-io/dyrectorio/issues/652))
* **(web):** node builds ([#645](https://github.com/dyrector-io/dyrectorio/issues/645))
* rename dyrectorio to dyrector.io in docs ([#644](https://github.com/dyrector-io/dyrectorio/issues/644))
* add missing LOG_LEVEL for the project ([#638](https://github.com/dyrector-io/dyrectorio/issues/638))
* **(crux):** nullpointer in ContainerStateMessage mapping ([#621](https://github.com/dyrector-io/dyrectorio/issues/621))
* **(ci):** run pipelines on edit pr  ([#608](https://github.com/dyrector-io/dyrectorio/issues/608))
* **(ci):** labeler fork repository dependency ([#610](https://github.com/dyrector-io/dyrectorio/issues/610))
* **(ci):** fix stable push on main branch ([#607](https://github.com/dyrector-io/dyrectorio/issues/607))

### Refactor

* rename product to project ([#654](https://github.com/dyrector-io/dyrectorio/issues/654))
* use map for environment instead of pipes ([#617](https://github.com/dyrector-io/dyrectorio/issues/617))
* **(crux):** remove shared module ([#602](https://github.com/dyrector-io/dyrectorio/issues/602))
* **(cli):** add documentation, clean up, fix minor bugs ([#604](https://github.com/dyrector-io/dyrectorio/issues/604))


<a name="0.4.2"></a>
## [0.4.2](https://github.com/dyrector-io/dyrectorio/compare/0.4.1...0.4.2) (2023-06-05)

### Fix

* **(web):** registry create, pagination, node page and instance secrets ([#656](https://github.com/dyrector-io/dyrectorio/issues/656))


<a name="0.4.1"></a>
## [0.4.1](https://github.com/dyrector-io/dyrectorio/compare/0.4.0...0.4.1) (2023-05-11)

### Fix

* **(ci):** check_version.sh sh compilance ([#603](https://github.com/dyrector-io/dyrectorio/issues/603))
* **(ci):** rebuild everything on release ([#601](https://github.com/dyrector-io/dyrectorio/issues/601))


<a name="0.4.0"></a>
## [0.4.0](https://github.com/dyrector-io/dyrectorio/compare/0.3.4...0.4.0) (2023-05-11)

### Chore

* add offline bundle Makefile target ([#558](https://github.com/dyrector-io/dyrectorio/issues/558))

### Doc

* refactor the README.md & add some FAQs from users ([#523](https://github.com/dyrector-io/dyrectorio/issues/523))

### Docs

* add CLI docs link to readme ([#595](https://github.com/dyrector-io/dyrectorio/issues/595))
* remove unused texts from README.md ([#593](https://github.com/dyrector-io/dyrectorio/issues/593))
* **(web):** improve descriptions of the api ([#579](https://github.com/dyrector-io/dyrectorio/issues/579))
* change for to where in README ([#528](https://github.com/dyrector-io/dyrectorio/issues/528))

### Feat

* **(web):** container config annotations ([#587](https://github.com/dyrector-io/dyrectorio/issues/587))
* **(web):** deployment and event index ([#585](https://github.com/dyrector-io/dyrectorio/issues/585))
* **(web):** team invite captcha error ([#581](https://github.com/dyrector-io/dyrectorio/issues/581))
* introduce yamlfmt and apply formatting ([#580](https://github.com/dyrector-io/dyrectorio/issues/580))
* **(web):** http and ws audit log ([#570](https://github.com/dyrector-io/dyrectorio/issues/570))
* **(ci):** add .md files to documentation source ([#572](https://github.com/dyrector-io/dyrectorio/issues/572))
* **(ci):** add PR labeling based on title ([#562](https://github.com/dyrector-io/dyrectorio/issues/562))
* **(ci):** validate title of the PR ([#557](https://github.com/dyrector-io/dyrectorio/issues/557))
* **(crux):** OpenAPI description and summary extensions  ([#560](https://github.com/dyrector-io/dyrectorio/issues/560))
* **(crux):** OpenAPI description improvements ([#549](https://github.com/dyrector-io/dyrectorio/issues/549))
* **(crux):** validate all HTTP UUID Params ([#532](https://github.com/dyrector-io/dyrectorio/issues/532))
* **(ci):** add pr labeler ([#556](https://github.com/dyrector-io/dyrectorio/issues/556))
* **(crux):** deployment events api ([#544](https://github.com/dyrector-io/dyrectorio/issues/544))
* **(crux-ui):** signup page responsive ([#547](https://github.com/dyrector-io/dyrectorio/issues/547))
* **(web):** team invite recaptcha ([#541](https://github.com/dyrector-io/dyrectorio/issues/541))
* **(web):** health http api ([#527](https://github.com/dyrector-io/dyrectorio/issues/527))
* **(crux):** node container status list ([#526](https://github.com/dyrector-io/dyrectorio/issues/526))
* **(web):** implemented nodes http api ([#520](https://github.com/dyrector-io/dyrectorio/issues/520))
* **(web):** storage http api ([#515](https://github.com/dyrector-io/dyrectorio/issues/515))
* **(web):** implement template and notification http apis ([#513](https://github.com/dyrector-io/dyrectorio/issues/513))
* **(cli):** add silent mode, hiding welcome message ([#518](https://github.com/dyrector-io/dyrectorio/issues/518))
* container runtime version check ([#491](https://github.com/dyrector-io/dyrectorio/issues/491))
* **(web):** refactor gRPC to HTTP API ([#506](https://github.com/dyrector-io/dyrectorio/issues/506))
* storage ([#493](https://github.com/dyrector-io/dyrectorio/issues/493))
* **(web):** add kratos rate limit ([#482](https://github.com/dyrector-io/dyrectorio/issues/482))
* implement Audit and Dashboard APIs ([#495](https://github.com/dyrector-io/dyrectorio/issues/495))
* add production ready compose file ([#483](https://github.com/dyrector-io/dyrectorio/issues/483))
* **(web):** send cookies in grpc metadata ([#485](https://github.com/dyrector-io/dyrectorio/issues/485))
* **(crux):** add deployment events API & path image ([#484](https://github.com/dyrector-io/dyrectorio/issues/484))
* **(web):** copy deployments from default version ([#481](https://github.com/dyrector-io/dyrectorio/issues/481))
* **(web):** reset container field buttons ([#467](https://github.com/dyrector-io/dyrectorio/issues/467))
* **(crux):** swagger [@ApiBody](https://github.com/ApiBody)({}) DTO generator ([#463](https://github.com/dyrector-io/dyrectorio/issues/463))
* **(crux-ui):** select initial config filters based on node type ([#476](https://github.com/dyrector-io/dyrectorio/issues/476))

### Fix

* improver release target in makefile ([#600](https://github.com/dyrector-io/dyrectorio/issues/600))
* **(web):** finetuning in docker-compose ([#599](https://github.com/dyrector-io/dyrectorio/issues/599))
* minor fixes ([#597](https://github.com/dyrector-io/dyrectorio/issues/597))
* **(cli):** invalid gRPC port ([#596](https://github.com/dyrector-io/dyrectorio/issues/596))
* **(web):** websocket connection issues ([#591](https://github.com/dyrector-io/dyrectorio/issues/591))
* **(crux):** team delete audit fix & version list name filter ([#592](https://github.com/dyrector-io/dyrectorio/issues/592))
* **(ci):** image builder ([#586](https://github.com/dyrector-io/dyrectorio/issues/586))
* **(crux):** nestjs clientStream workaround ([#590](https://github.com/dyrector-io/dyrectorio/issues/590))
* rename emails ([#582](https://github.com/dyrector-io/dyrectorio/issues/582))
* production compose database healthcheck user ([#577](https://github.com/dyrector-io/dyrectorio/issues/577))
* nodejs dns resolution ([#576](https://github.com/dyrector-io/dyrectorio/issues/576))
* **(web):** node page connection bugs ([#574](https://github.com/dyrector-io/dyrectorio/issues/574))
* reorder some of the sections in the README.md ([#573](https://github.com/dyrector-io/dyrectorio/issues/573))
* swagger path ([#569](https://github.com/dyrector-io/dyrectorio/issues/569))
* labeler refactor ([#575](https://github.com/dyrector-io/dyrectorio/issues/575))
* **(crux):** node update ([#568](https://github.com/dyrector-io/dyrectorio/issues/568))
* **(ci):** labeling by title ([#571](https://github.com/dyrector-io/dyrectorio/issues/571))
* **(ci):** PR labeling based on changes ([#565](https://github.com/dyrector-io/dyrectorio/issues/565))
* **(crux):** add missing optionals to DTOs ([#554](https://github.com/dyrector-io/dyrectorio/issues/554))
* **(web):** move notifications & add API optionals ([#551](https://github.com/dyrector-io/dyrectorio/issues/551))
* respect dynamic email configuration & cli fixes ([#550](https://github.com/dyrector-io/dyrectorio/issues/550))
* **(crux-ui):** instance config editor bugs ([#543](https://github.com/dyrector-io/dyrectorio/issues/543))
* **(crux-ui):** hydration errors ([#546](https://github.com/dyrector-io/dyrectorio/issues/546))
* **(crux):** api schema errors ([#542](https://github.com/dyrector-io/dyrectorio/issues/542))
* **(web):** minor ui bugs ([#531](https://github.com/dyrector-io/dyrectorio/issues/531))
* changelog should be optional ([#539](https://github.com/dyrector-io/dyrectorio/issues/539))
* node get script open-api return type ([#540](https://github.com/dyrector-io/dyrectorio/issues/540))
* **(crux):** OpenAPI improvements  ([#536](https://github.com/dyrector-io/dyrectorio/issues/536))
* controller route params ([#538](https://github.com/dyrector-io/dyrectorio/issues/538))
* createdBy mapping ([#537](https://github.com/dyrector-io/dyrectorio/issues/537))
* createdBy mapping
* improve the CLI Docker Engine Server errror message ([#533](https://github.com/dyrector-io/dyrectorio/issues/533))
* run log and trace when the pipeline failed ([#529](https://github.com/dyrector-io/dyrectorio/issues/529))
* **(agent):** import container ([#524](https://github.com/dyrector-io/dyrectorio/issues/524))
* **(crux):** jwt identity ([#530](https://github.com/dyrector-io/dyrectorio/issues/530))
* **(cli):** add missing protocol for CRUX_UI_URL ([#521](https://github.com/dyrector-io/dyrectorio/issues/521))
* dyrectorio compose traefik has missing labels ([#516](https://github.com/dyrector-io/dyrectorio/issues/516))
* **(cli):** crux unreachable via localhost using cli ([#514](https://github.com/dyrector-io/dyrectorio/issues/514))
* **(ci):** image push upon pipeline completion ([#510](https://github.com/dyrector-io/dyrectorio/issues/510))
* **(crux):** joining script for nodes when using podman ([#499](https://github.com/dyrector-io/dyrectorio/issues/499))
* agent version, add missing env ([#494](https://github.com/dyrector-io/dyrectorio/issues/494))
* **(crux):** grpc identity illegal characters ([#492](https://github.com/dyrector-io/dyrectorio/issues/492))
* **(crux-ui):** flaky image config test ([#486](https://github.com/dyrector-io/dyrectorio/issues/486))
* **(crux):** token delete access guard & unique key & ui delete ([#477](https://github.com/dyrector-io/dyrectorio/issues/477))
* **(ci):** pipeline set output tag syntax error
* change to tags to use stable everywhere ([#496](https://github.com/dyrector-io/dyrectorio/issues/496))

### Refactor

* remove /new tag from crux api ([#567](https://github.com/dyrector-io/dyrectorio/issues/567))
* **(web):** registry connections ([#566](https://github.com/dyrector-io/dyrectorio/issues/566))
* **(web):** move websocket to crux ([#548](https://github.com/dyrector-io/dyrectorio/issues/548))
* golang integration tests ([#525](https://github.com/dyrector-io/dyrectorio/issues/525))
* **(web):** Teams http api ([#522](https://github.com/dyrector-io/dyrectorio/issues/522))
* **(web):** deployment http api ([#519](https://github.com/dyrector-io/dyrectorio/issues/519))
* add Container better builder interfacing ([#517](https://github.com/dyrector-io/dyrectorio/issues/517))
* **(web):** image endpoints ([#512](https://github.com/dyrector-io/dyrectorio/issues/512))
* **(crux-ui):** wait for url ([#501](https://github.com/dyrector-io/dyrectorio/issues/501))
* **(cli):** add dynamic prefix, removed swallowed params ([#509](https://github.com/dyrector-io/dyrectorio/issues/509))
* change dynamic crane manifests & dynamic tags ([#508](https://github.com/dyrector-io/dyrectorio/issues/508))
* container management ([#488](https://github.com/dyrector-io/dyrectorio/issues/488))


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

### Docs

* edit readmes ([#374](https://github.com/dyrector-io/dyrectorio/issues/374))
* add resolution for IDP ([#322](https://github.com/dyrector-io/dyrectorio/issues/322))

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
## [v0.1.1](https://github.com/dyrector-io/dyrectorio/compare/0.1.1...v0.1.1) (2022-08-03)


<a name="0.1.1"></a>
## [0.1.1](https://github.com/dyrector-io/dyrectorio/compare/v0.1.0...0.1.1) (2022-08-03)

### Chore

* clean README.mds & generate changelog ([#57](https://github.com/dyrector-io/dyrectorio/issues/57))

### Fix

* rename the install script files ([#63](https://github.com/dyrector-io/dyrectorio/issues/63))
* change the manifest paths ([#60](https://github.com/dyrector-io/dyrectorio/issues/60))

### Refactor

* **(agent):** tests ([#54](https://github.com/dyrector-io/dyrectorio/issues/54))


<a name="v0.1.0"></a>
## [v0.1.0](https://github.com/dyrector-io/dyrectorio/compare/0.1.0...v0.1.0) (2022-08-01)


<a name="0.1.0"></a>
## [0.1.0](https://github.com/dyrector-io/dyrectorio/compare/0.0.1...0.1.0) (2022-08-01)

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

### Ci

* agent pipeline with tests & signing ([#3](https://github.com/dyrector-io/dyrectorio/issues/3))
* add web-crux workflow
* add lint to auth, apply suggested linter changes
* add basic CI functions for frontend, backend, agent and auth services

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

