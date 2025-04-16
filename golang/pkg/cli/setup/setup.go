package setup

import (
	"bufio"
	"crypto/rand"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
	"github.com/joho/godotenv"
	permbits "github.com/na4ma4/go-permbits"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	ucli "github.com/urfave/cli/v2"
	"golang.org/x/term"

	reporoot "github.com/dyrector-io/dyrectorio"
	"github.com/dyrector-io/dyrectorio/golang/internal/util"
)

// baking the files in ensures that we have files that works with the actual version and branch
// but I couldn't find a way to make go:embed use files from the project root

const (
	mailURL             = "http://localhost:4436"
	defaultSecretLength = 32
	cruxSecretLength    = 43
)

const (
	FlagNoCompose              = "no-compose"
	FlagDyoVersion             = "dyo-version"
	FlagDeployTestMail         = "deploy-test-mail"
	FlagDeployTraefik          = "deploy-traefik"
	FlagAddTraefikLabels       = "add-traefik-labels"
	FlagUseHTTPS               = "use-https"
	FlagAcmeEmail              = "acme-email"
	FlagDomain                 = "domain"
	FlagSMTPUri                = "smtp-uri"
	FlagFromEmail              = "from-email"
	FlagFromName               = "from-name"
	FlagCruxEncryptionKey      = "encryption-secret-key"
	FlagKratosPostgresPassword = "kratos-postgres-password" // #nosec 101 // these are not passwords
	FlagCruxPostgresPassword   = "crux-postgres-password"   // #nosec 101 // these are not passwords
	FlagRootPostgresPassword   = "root-postgres-password"   // #nosec 101 // these are not passwords
	FlagCruxSecret             = "crux-secret"
	FlagKratosSecret           = "kratos-secret"
	FlagComposeDir             = "compose-dir"
)

type Config struct {
	AcmeEmail              string
	ComposeFile            string
	CruxSecret             string
	CruxPostgresPassword   string
	CruxAgentHost          string
	EncryptionSecretKey    string
	ExternalPort           string
	ExternalProto          string
	Domain                 string
	DyoVersion             string
	FromEmail              string
	FromName               string
	KratosPostgresPassword string
	KratosSecret           string
	RootPostgresPassword   string
	NodeEnv                string
	SmtpURI                string //nolint
	AddTraefikLabels       bool
	DeployTestMail         bool
	DeployTraefik          bool
	NoCompose              bool
	UseHTTPS               bool
}

func (cfg *Config) ToMap() map[string]string {
	result := make(map[string]string)
	val := reflect.ValueOf(*cfg)
	typeOfCfg := val.Type()

	for i := range val.NumField() {
		field := typeOfCfg.Field(i)
		value := val.Field(i)
		if value.Kind() == reflect.String {
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

func anyMatch(str string, matchOpt ...string) bool {
	for _, m := range matchOpt {
		if str == m {
			return true
		}
	}
	return false
}

func PromptBoolOrExit(sc *bufio.Scanner) bool {
	for {
		sc.Scan()
		in := sc.Text()
		switch {
		// positive cases
		case anyMatch(in, "y", "yes"):
			return true

		// negative cases
		case anyMatch(in, "no", "n"):
			return false

		// exit cases
		case anyMatch(in, "q", "quit", "exit"):
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

	log.Print("Entered the dyrectorio wizard which will help you configure your dyrectorio instance for dev or production purposes.")
	log.Print("--------------------------------")
	log.Print("Info:")
	log.Print("Use 'q' to quit the wizard at any time")
	log.Print("Configuration files will be generated in your current directory")
	log.Print("Press any key to start the configuration...")
	scanner.Scan()
	log.Print("We rely on custom reverse proxy configuration and for that we use Traefik.")
	log.Print("You could use different proxies as well, if you do so you are on your own for now.")
	log.Print("Deploy Traefik? (y/n) ")
	cfg.DeployTraefik = PromptBoolOrExit(scanner)

	if !cfg.DeployTraefik {
		log.Print("Add Traefik labels regardless? If you already have Traefik running (y/n) ")
		cfg.AddTraefikLabels = PromptBoolOrExit(scanner)
	} else {
		cfg.AddTraefikLabels = true
	}

	log.Print("For basic user management, an e-mail service is necessary, you can use the provided dummy mail service for testing.")
	log.Print("Deploy Test Mail service? (y/n) ")
	cfg.DeployTestMail = PromptBoolOrExit(scanner)

	if cfg.DeployTestMail {
		cfg.SmtpURI = "smtps://test:test@mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"
		cfg.FromEmail = "demo@test.dyrector.io"
		cfg.FromName = "dyrectorio demo"
		log.Printf("After deployment, you can reach the mail service at: %s", mailURL)
	} else {
		log.Print("Enter SMTP URI:")
		log.Print("Examples: smtp://user:pass@host:port, smtp://user:pass@host:port?skip_ssl_verify=true&legacy_ssl=true")
		cfg.SmtpURI = PromptText(scanner)

		log.Print("Enter From Email: ")
		cfg.FromEmail = PromptText(scanner)

		log.Print("Enter From Name: ")
		cfg.FromName = PromptText(scanner)
	}
	log.Print("Use HTTPS? (y/n) ")
	cfg.UseHTTPS = PromptBoolOrExit(scanner)
	if cfg.UseHTTPS {
		cfg.ExternalProto = "https"
		cfg.NodeEnv = "production"
	} else {
		cfg.ExternalProto = "http"
		cfg.NodeEnv = "development"
	}

	log.Print("Enter domain (examples: localhost:8080, test.yourdomain.com): ")
	for {
		cfg.Domain = PromptText(scanner)
		if cfg.Domain != "" {
			break
		}
		log.Print("Domain cannot be empty. Please enter a valid domain: ")
	}

	if cfg.UseHTTPS {
		log.Print("Enter ACME Email: ")
		cfg.AcmeEmail = PromptText(scanner)
	}
}

func isTTY() bool {
	return term.IsTerminal(int(os.Stdout.Fd()))
}

func randomString(length int) string {
	bytes := make([]byte, length/2+1)
	_, err := rand.Read(bytes)
	if err != nil {
		panic(err)
	}
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
		log.Printf("Writing file: %s", item.Path)
		err := os.WriteFile(item.Path, item.Content, permbits.UserReadWrite)
		if err != nil {
			if os.IsNotExist(err) {
				err = os.MkdirAll(filepath.Dir(item.Path), permbits.UserAll+permbits.GroupAll)
				if err != nil {
					return err
				}
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

func GetItems(composeFolder string, deployTestMail, deployTraefik, addTraefikLabels, tls bool) ComposeItems {
	items := []ComposeItem{{
		Path:    "docker-compose.yaml",
		Content: reporoot.ComposeBase,
	}}

	if deployTestMail {
		items = append(items,
			ComposeItem{
				Path:    filepath.Join(composeFolder, "docker-compose.mail-test.yaml"),
				Content: reporoot.MailCompose,
			})
	}
	if deployTraefik {
		if tls {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join(composeFolder, "docker-compose.traefik-tls.yaml"),
					Content: reporoot.TraefikTLSCompose,
				})
		} else {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join(composeFolder, "docker-compose.traefik.yaml"),
					Content: reporoot.TraefikCompose,
				})
		}
	}
	if addTraefikLabels {
		items = append(items,
			ComposeItem{
				Path:    filepath.Join(composeFolder, "docker-compose.traefik-labels.yaml"),
				Content: reporoot.TraefikLabelsCompose,
			})
		if tls {
			items = append(items,
				ComposeItem{
					Path:    filepath.Join(composeFolder, "docker-compose.traefik-labels-tls.yaml"),
					Content: reporoot.TraefikLabelsTLSCompose,
				})
		}
	}

	return items
}

func customZerologLogger() zerolog.Logger {
	output := zerolog.ConsoleWriter{Out: os.Stdout, FormatTimestamp: func(any) string { return "" }}

	output.FormatLevel = func(any) string {
		return "dyo>"
	}

	return zerolog.New(output).With().Logger()
}

func GenerateComposeConfig(cCtx *ucli.Context) error {
	log.Logger = customZerologLogger()
	cfg := Config{
		DeployTestMail:         cCtx.Bool(FlagDeployTestMail),
		DeployTraefik:          cCtx.Bool(FlagDeployTraefik),
		AddTraefikLabels:       cCtx.Bool(FlagAddTraefikLabels),
		UseHTTPS:               cCtx.Bool(FlagUseHTTPS),
		AcmeEmail:              cCtx.String(FlagAcmeEmail),
		Domain:                 cCtx.String(FlagDomain),
		SmtpURI:                cCtx.String(FlagSMTPUri),
		FromEmail:              cCtx.String(FlagFromEmail),
		FromName:               cCtx.String(FlagFromName),
		DyoVersion:             cCtx.String(FlagDyoVersion),
		EncryptionSecretKey:    cCtx.String(FlagCruxEncryptionKey),
		CruxPostgresPassword:   cCtx.String(FlagCruxPostgresPassword),
		KratosPostgresPassword: cCtx.String(FlagKratosPostgresPassword),
		KratosSecret:           cCtx.String(FlagKratosSecret),
		CruxSecret:             cCtx.String(FlagCruxSecret),
		RootPostgresPassword:   cCtx.String(FlagRootPostgresPassword),
	}

	if isTTY() {
		cfg.PromptUserInput()
	} else {
		log.Printf("Non-interative session, expecting all flags to be set")
	}

	if !cCtx.Bool(FlagNoCompose) {
		composeFiles := GetItems(cCtx.String(FlagComposeDir),
			cfg.DeployTestMail,
			cfg.DeployTraefik,
			cfg.AddTraefikLabels,
			cfg.UseHTTPS)
		cfg.ComposeFile = strings.Join(composeFiles.GetFileNames(), ":")

		err := composeFiles.WriteToDisk()
		if err != nil {
			return err
		}
	}

	if strings.Contains(cfg.Domain, ":") {
		host, port, err := net.SplitHostPort(cfg.Domain)
		if err != nil {
			return err
		}
		cfg.Domain = host
		if host == "localhost" {
			cfg.CruxAgentHost = "host.docker.internal"
		}
		isNonDefaultPort := (cfg.UseHTTPS && port != "443") || (!cfg.UseHTTPS && port != "80")
		if isNonDefaultPort {
			cfg.ExternalPort = port
		}
	}

	if err := godotenv.Write(cfg.ToMap(), ".env"); err != nil {
		return err
	}

	log.Print("You can start the project with the command: docker compose up -d")
	if cfg.DeployTestMail {
		log.Printf("The UI should be available at %s://%s%s", cfg.ExternalProto, cfg.Domain, cfg.ExternalPort)
		log.Printf("The e-mail service should be available at %s location", mailURL)
	}

	return nil
}

func Setup() *ucli.Command {
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
				Usage: "Writes mail service compose file and concatenates it to base compose file in the generated .env file",
			},
			&ucli.BoolFlag{
				Name:  FlagDeployTraefik,
				Usage: "Writes Traefik compose file and concatenates it to base compose file in the generated .env file",
			},
			&ucli.BoolFlag{
				Name:  FlagAddTraefikLabels,
				Usage: "If you opted for deploying Traefik, you can still have the labels added, so the one running can use it",
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
				Name:  FlagSMTPUri,
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
				Name:  FlagComposeDir,
				Usage: "Path of the directory were the additional compose files should be placed",
				Value: "compose",
			},
			&ucli.StringFlag{
				Name:        FlagCruxEncryptionKey,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxEncryptionKey)], randomString(cruxSecretLength)),
			},
			&ucli.StringFlag{
				Name:        FlagCruxPostgresPassword,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxPostgresPassword)], randomString(defaultSecretLength)),
			},
			&ucli.StringFlag{
				Name:        FlagKratosPostgresPassword,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagKratosPostgresPassword)], randomString(defaultSecretLength)),
			},
			&ucli.StringFlag{
				Name:        FlagRootPostgresPassword,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagRootPostgresPassword)], randomString(defaultSecretLength)),
			},
			&ucli.StringFlag{
				Name:        FlagCruxSecret,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagCruxSecret)], randomString(defaultSecretLength)),
			},
			&ucli.StringFlag{
				Name:        FlagKratosSecret,
				DefaultText: "auto-generated",
				Value:       util.Fallback(envMap[toEnvCase(FlagKratosSecret)], randomString(defaultSecretLength)),
			},
		},
	}
}
