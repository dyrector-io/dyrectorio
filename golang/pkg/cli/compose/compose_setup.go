package compose

import (
	"bufio"
	"crypto/rand"
	_ "embed"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/dyrector-io/dyrectorio/golang/internal/util"
	"github.com/iancoleman/strcase"
	"github.com/joho/godotenv"
	permbits "github.com/na4ma4/go-permbits"
	ucli "github.com/urfave/cli/v2"
	"golang.org/x/term"
)

// baking the files in ensures that we have files that works with the actual version and branch
// but I couldn't find a way to make go:embed use files from the project root

const mailURL = "http://localhost:4436"

//go:embed files/docker-compose.yaml
var composeBase []byte

//go:embed files/docker-compose.traefik.yaml
var traefikCompose []byte

//go:embed files/docker-compose.traefik-tls.yaml
var traefikTLSCompose []byte

//go:embed files/docker-compose.traefik-labels.yaml
var traefikLabelsCompose []byte

//go:embed files/docker-compose.traefik-labels-tls.yaml
var traefikLabelsTLSCompose []byte

//go:embed files/docker-compose.mail-test.yaml
var mailCompose []byte

const (
	FlagNoCompose              = "no-compose"
	FlagDyoVersion             = "dyo-version"
	FlagDeployTestMail         = "deploy-test-mail"
	FlagDeployTraefik          = "deploy-traefik"
	FlagAddTraefikLabels       = "add-traefik-labels"
	FlagUseHTTPS               = "use-https"
	FlagAcmeEmail              = "acme-email"
	FlagDomain                 = "domain"
	FlagSmtpURI                = "smtp-uri"
	FlagFromEmail              = "from-email"
	FlagFromName               = "from-name"
	FlagCruxEncryptionKey      = "encryption-secret-key"
	FlagKratosPostgresPassword = "kratos-postgres-password"
	FlagCruxPostgresPassword   = "crux-postgres-password"
	FlagCruxSecret             = "crux-secret"
	FlagKratosSecret           = "kratos-secret"
)

type Config struct {
	NoCompose              bool
	DeployTestMail         bool
	DeployTraefik          bool
	AddTraefikLabels       bool
	UseHTTPS               bool
	ExternalPort           string
	DyoVersion             string
	ComposeFile            string
	ExternalProto          string
	AcmeEmail              string
	Domain                 string
	SmtpURI                string
	FromEmail              string
	FromName               string
	EncryptionSecretKey    string
	CruxPostgresPassword   string
	KratosPostgresPassword string
	KratosSecret           string
	CruxSecret             string
}

func (cfg *Config) ToMap() map[string]string {
	result := make(map[string]string)
	val := reflect.ValueOf(*cfg)
	typeOfCfg := val.Type()

	for i := range val.NumField() {
		field := typeOfCfg.Field(i)
		value := val.Field(i)
		switch value.Kind() {
		// we dont want booleans in our .env file now
		// case reflect.Bool:
		// 	result[strings.ToUpper(field.Name)] = fmt.Sprintf("%t", value.Bool())
		case reflect.String:
			str := value.String()
			if str != "" {
				result[toEnvCase(field.Name)] = str
			}
		}
	}
	return result
}

func toEnvCase(s string) string {
	return strcase.ToScreamingDelimited(s, '_', "", true)
}

// Validate returns nil if valid the error contains the validation errors on failure
func (cfg *Config) Validate() error {
	return nil
}

func PromptBoolOrExit(sc *bufio.Scanner) bool {
	for {
		sc.Scan()
		in := sc.Text()
		switch in {
		// positive cases
		case "y":
			fallthrough
		case "yes":
			return true

		// negative cases
		case "no":
			fallthrough
		case "n":
			return false

		// exit cases
		case "q":
			fallthrough
		case "quit":
			fallthrough
		case "exit":
			log.Printf("User exit")
			os.Exit(1)
		default:
			log.Printf("Hint: valid values (y/n/q)")
		}
	}
}

func PromptText(sc *bufio.Scanner) string {
	sc.Scan()
	return sc.Text()
}

func (cfg *Config) PromptUserInput() {
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Print("We rely on custom reverse proxy configuration and for that we use Traefik.\n")
	fmt.Print("You could use different proxies as well, if you do so you are on your own for now.\n")
	fmt.Print("Deploy Traefik? (y/n) ")
	cfg.DeployTraefik = PromptBoolOrExit(scanner)

	if cfg.DeployTraefik == false {
		fmt.Print("Add Traefik labels regardless? If you already have Traefik running (y/n) ")
		cfg.AddTraefikLabels = PromptBoolOrExit(scanner)
	} else {
		cfg.AddTraefikLabels = true
	}

	fmt.Print("Deploy Test Mail service? (y/n) ")
	cfg.DeployTestMail = PromptBoolOrExit(scanner)

	if cfg.DeployTestMail {
		cfg.SmtpURI = "smtps://test:test@mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"
		cfg.FromEmail = "demo@test.dyrector.io"
		cfg.FromName = "dyrectorio demo"
		fmt.Printf("After deployment, you can reach the mail service at: %s\n", mailURL)

	} else {
		fmt.Print("Enter SMTP URI: ")
		cfg.SmtpURI = PromptText(scanner)

		fmt.Print("Enter From Email: ")
		cfg.FromEmail = PromptText(scanner)

		fmt.Print("Enter From Name: ")
		cfg.FromName = PromptText(scanner)
	}
	fmt.Print("Use HTTPS? (y/n) ")
	cfg.UseHTTPS = PromptBoolOrExit(scanner)
	if cfg.UseHTTPS {
		cfg.ExternalProto = "https"
	} else {
		cfg.ExternalProto = "http"
	}

	fmt.Print("Enter domain (examples: localhost:8080, test.yourdomain.com): ")
	cfg.Domain = PromptText(scanner)

	if cfg.UseHTTPS {
		fmt.Print("Enter ACME Email: ")
		cfg.AcmeEmail = PromptText(scanner)
	}
}

func isTTY() bool {
	return term.IsTerminal(int(os.Stdout.Fd()))
}

func randomString(length int) string {
	bytes := make([]byte, length/2+1)
	rand.Read(bytes)
	return fmt.Sprintf("%x", bytes)[0:length]
}

type (
	ComposeItems []ComposeItem
	ComposeItem  struct {
		Path    string
		Content []byte
	}
)

func (c ComposeItems) GetFileNames() []string {
	files := []string{}
	for _, item := range c {
		files = append(files, item.Path)
	}
	return files
}

func (c ComposeItems) WriteToDisk() error {
	for _, item := range c {
		fmt.Printf("Writing file: %s\n", item.Path)
		err := os.WriteFile(item.Path, item.Content, permbits.UserReadWrite)
		if err != nil {
			if os.IsNotExist(err) {
				os.MkdirAll(filepath.Dir(item.Path), permbits.UserAll+permbits.GroupAll)
				err = os.WriteFile(item.Path, item.Content, permbits.UserReadWrite)
				if err != nil {
					return err
				}
			} else {
				return err
			}
		}
	}

	return nil
}

func GetItems(deployTestMail, deployTraefik, addTraefikLabels, tls bool) ComposeItems {
	items := []ComposeItem{{
		Path:    filepath.Join("docker-compose.yaml"),
		Content: composeBase,
	}}

	if deployTestMail {
		items = append(items,
			ComposeItem{
				Path:    filepath.Join("compose", "docker-compose.mail-test.yaml"),
				Content: mailCompose,
			})
	}
	if deployTraefik {
		if tls {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join("compose", "docker-compose.traefik-tls.yaml"),
					Content: traefikCompose,
				})
		} else {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join("compose", "docker-compose.traefik.yaml"),
					Content: traefikCompose,
				})
		}
	}
	if addTraefikLabels {
		items = append(items,
			ComposeItem{
				Path:    filepath.Join("compose", "docker-compose.traefik-labels.yaml"),
				Content: traefikLabelsCompose,
			})
		if tls {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join("compose", "docker-compose.traefik-labels-tls.yaml"),
					Content: traefikCompose,
				})
		}
	}

	return items
}

func GenerateComposeConfig(cCtx *ucli.Context) error {
	cfg := Config{
		DeployTestMail:         cCtx.Bool(FlagDeployTestMail),
		DeployTraefik:          cCtx.Bool(FlagDeployTraefik),
		AddTraefikLabels:       cCtx.Bool(FlagAddTraefikLabels),
		UseHTTPS:               cCtx.Bool(FlagUseHTTPS),
		AcmeEmail:              cCtx.String(FlagAcmeEmail),
		Domain:                 cCtx.String(FlagDomain),
		SmtpURI:                cCtx.String(FlagSmtpURI),
		FromEmail:              cCtx.String(FlagFromEmail),
		FromName:               cCtx.String(FlagFromName),
		DyoVersion:             cCtx.String(FlagDyoVersion),
		EncryptionSecretKey:    cCtx.String(FlagCruxEncryptionKey),
		CruxPostgresPassword:   cCtx.String(FlagCruxPostgresPassword),
		KratosPostgresPassword: cCtx.String(FlagKratosPostgresPassword),
		KratosSecret:           cCtx.String(FlagKratosSecret),
		CruxSecret:             cCtx.String(FlagCruxSecret),
	}

	if isTTY() {
		cfg.PromptUserInput()
	} else {
		log.Printf("Non-interative session, expecting all flags to be set")
	}

	if !cCtx.Bool(FlagNoCompose) {
		composeFiles := GetItems(cfg.DeployTestMail, cfg.DeployTraefik, cfg.AddTraefikLabels, cfg.UseHTTPS)
		cfg.ComposeFile = strings.Join(composeFiles.GetFileNames(), ":")

		err := composeFiles.WriteToDisk()
		if err != nil {
			return err
		}
	}

	if strings.Contains(cfg.Domain, ":") {
		host, port, err := net.SplitHostPort(cfg.Domain)
		cfg.Domain = host
		if err != nil {
			return err
		}
		if port != "443" && cfg.UseHTTPS {
			// if it's not the default port for protocol
			cfg.ExternalPort = ":" + port
		}
		if port != "80" && !cfg.UseHTTPS {
			// if it's not the default port for protocol
			cfg.ExternalPort = ":" + port
		}
	}

	if err := godotenv.Write(cfg.ToMap(), ".env"); err != nil {
		return err
	}

	fmt.Print("You can start the project with the command: docker compose up -d\n")
	if cfg.DeployTestMail {
		fmt.Printf("The UI should be available at %s://%s%s\n", cfg.ExternalProto, cfg.Domain, cfg.ExternalPort)
		fmt.Printf("The e-mail service should be available at %s location\n", mailURL)
	}

	return nil
}

func ComposeGenerateCommand() *ucli.Command {
	envMap, _ := godotenv.Read(".env")

	return &ucli.Command{
		Name:      "compose",
		Action:    GenerateComposeConfig,
		Usage:     "dyo gen compose",
		UsageText: "dyo gen compose -- without any flags in interactive mode will help you generate/load a set of compose files with .env files",
		Flags: []ucli.Flag{
			&ucli.BoolFlag{
				Name:  FlagNoCompose,
				Usage: "Disable the generation of compose files",
			},
			&ucli.BoolFlag{
				Name:  FlagDeployTestMail,
				Usage: "Downloads Mailsluper compose file and concatenates it to base compose file in the generated .env file",
			},
			&ucli.BoolFlag{
				Name:  FlagDeployTraefik,
				Usage: "Downloads Traefik compose file and concatenates it to base compose file in the generated .env file, you may not need this if you have Traefik installed already",
			},
			&ucli.BoolFlag{
				Name:  FlagAddTraefikLabels,
				Usage: "If you opted for deploying Traefik, you can still have the labels added, so the already present one can use it",
			},
			&ucli.BoolFlag{
				Name:  FlagUseHTTPS,
				Usage: "Adds Let's Encrypt related options to compose files",
			},
			&ucli.StringFlag{
				Name:  FlagDyoVersion,
				Usage: "Tag of the container images to be used in compose files",
			},
			&ucli.StringFlag{
				Name:  FlagAcmeEmail,
				Usage: "The mail used for Let's Encrypt",
			},
			&ucli.StringFlag{
				Name:  FlagDomain,
				Usage: "The domain used for host based routing and token generation",
			},
			&ucli.StringFlag{
				Name:  FlagSmtpURI,
				Usage: "The application needs a working SMTP service to function",
			},
			&ucli.StringFlag{
				Name:  FlagFromEmail,
				Usage: "Sender's smail address",
			},
			&ucli.StringFlag{
				Name:  FlagFromName,
				Usage: "Sender's name",
			},
			&ucli.StringFlag{
				Name:        FlagCruxEncryptionKey,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxEncryptionKey)], randomString(43)),
			},
			&ucli.StringFlag{
				Name:        FlagCruxPostgresPassword,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxPostgresPassword)], randomString(32)),
			},
			&ucli.StringFlag{
				Name:        FlagKratosPostgresPassword,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagKratosPostgresPassword)], randomString(32)),
			},
			&ucli.StringFlag{
				Name:        FlagCruxSecret,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxSecret)], randomString(32)),
			},
			&ucli.StringFlag{
				Name:        FlagKratosSecret,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagKratosSecret)], randomString(32)),
			},
		},
	}
}
