module github.com/dyrector-io/dyrectorio/golang

go 1.18

require (
	github.com/Microsoft/go-winio v0.5.0 // indirect
	github.com/docker/docker v20.10.17+incompatible
	github.com/docker/go-connections v0.4.0
	github.com/go-playground/validator/v10 v10.11.0
	github.com/joho/godotenv v1.4.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/leodido/go-urn v1.2.1 // indirect
	github.com/morikuni/aec v1.0.0 // indirect
	github.com/onsi/gomega v1.16.0 // indirect
	github.com/sirupsen/logrus v1.8.1 // indirect
	github.com/stretchr/testify v1.8.0
	github.com/urfave/cli/v2 v2.11.1
	golang.org/x/crypto v0.0.0-20220722155217-630584e8d5aa // indirect
	golang.org/x/net v0.0.0-20220728211354-c7608f3a8462
	golang.org/x/sys v0.1.0 // indirect
	google.golang.org/grpc v1.49.0

)

require (
	github.com/ProtonMail/gopenpgp/v2 v2.4.8
	github.com/dyrector-io/dyrectorio/protobuf v0.0.0-00010101000000-000000000000
	github.com/golang-jwt/jwt/v4 v4.4.2
	github.com/hashicorp/go-version v1.3.0
	github.com/ilyakaznacheev/cleanenv v1.4.0
	github.com/rs/zerolog v1.28.0
	golang.org/x/exp v0.0.0-20220722155223-a9213eeb770e
	google.golang.org/protobuf v1.28.1
	gopkg.in/yaml.v3 v3.0.1
)

require (
	cloud.google.com/go v0.99.0 // indirect
	github.com/Azure/go-autorest v14.2.0+incompatible // indirect
	github.com/Azure/go-autorest/autorest v0.11.18 // indirect
	github.com/Azure/go-autorest/autorest/adal v0.9.13 // indirect
	github.com/Azure/go-autorest/autorest/date v0.3.0 // indirect
	github.com/Azure/go-autorest/logger v0.2.1 // indirect
	github.com/Azure/go-autorest/tracing v0.6.0 // indirect
	github.com/BurntSushi/toml v1.2.0 // indirect
	github.com/ProtonMail/go-crypto v0.0.0-20220113124808-70ae35bab23f // indirect
	github.com/ProtonMail/go-mime v0.0.0-20220302105931-303f85f7fe0f // indirect
	github.com/moby/term v0.0.0-20220808134915-39b0c02b01ae // indirect
	github.com/onsi/ginkgo v1.16.4 // indirect
	gotest.tools/v3 v3.3.0 // indirect
	olympos.io/encoding/edn v0.0.0-20201019073823-d3554ca0b0a3 // indirect
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/docker/distribution v2.8.1+incompatible // indirect
	github.com/docker/go-units v0.4.0 // indirect
	github.com/go-playground/locales v0.14.0 // indirect
	github.com/go-playground/universal-translator v0.18.0 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.0.2 // indirect
	github.com/pkg/errors v0.9.1
	github.com/pmezard/go-difflib v1.0.0 // indirect
	golang.org/x/text v0.3.7 // indirect
	google.golang.org/genproto v0.0.0-20211208223120-3a66f561d7aa // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)

require (
	github.com/go-logr/logr v1.2.0 // indirect
	github.com/google/go-cmp v0.5.8 // indirect
	github.com/google/gofuzz v1.2.0 // indirect
	github.com/imdario/mergo v0.3.12 // indirect
	golang.org/x/oauth2 v0.0.0-20211104180415-d3ed0bb246c8 // indirect
	golang.org/x/term v0.0.0-20220411215600-e5f449aeb171 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	k8s.io/api v0.23.1
	k8s.io/apimachinery v0.23.1
	k8s.io/client-go v0.23.1
	k8s.io/klog/v2 v2.30.0 // indirect
	k8s.io/utils v0.0.0-20210930125809-cb0fa318a74b // indirect
)

require (
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/form3tech-oss/jwt-go v3.2.3+incompatible // indirect
	github.com/googleapis/gnostic v0.5.5 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.16 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/xrash/smetrics v0.0.0-20201216005158-039620a65673 // indirect
	golang.org/x/time v0.0.0-20220722155302-e5dcc9cfc0b9 // indirect
	gopkg.in/inf.v0 v0.9.1 // indirect
	k8s.io/kube-openapi v0.0.0-20211115234752-e816edb12b65 // indirect
	sigs.k8s.io/json v0.0.0-20211020170558-c049b76a60c6 // indirect
	sigs.k8s.io/structured-merge-diff/v4 v4.1.2 // indirect
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace github.com/dyrector-io/dyrectorio/golang => ./

replace github.com/dyrector-io/dyrectorio/protobuf => ../protobuf