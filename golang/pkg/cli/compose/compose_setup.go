package compose

import (
	"bufio"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/docker/docker/client"
	"github.com/joho/godotenv"
	ucli "github.com/urfave/cli/v2"
	"golang.org/x/term"
)

const defaultBranch = "feat/simplified-install-script"

type Config struct {
	Compose                string
	DeployTestMail         bool
	DeployTraefik          bool
	AddTraefikLabels       bool
	UseHTTPS               bool
	AcmeEmail              string
	Domain                 string
	SmtpURI                string
	FromEmail              string
	FromName               string
	EncryptionKey          string
	CruxPostgresPassword   string
	KratosPostgresPassword string
	KratosSecret           string
	CruxSecret             string
}

func (cfg *Config) ToMap() map[string]string {
	result := make(map[string]string)
	val := reflect.ValueOf(*cfg)
	typeOfCfg := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typeOfCfg.Field(i)
		value := val.Field(i)
		switch value.Kind() {
		case reflect.Bool:
			result[strings.ToUpper(field.Name)] = fmt.Sprintf("%t", value.Bool())
		case reflect.String:
			result[strings.ToUpper(field.Name)] = value.String()
		}
	}
	return result
}

// Validate returns nil if valid the error contains the validation errors on failure
func (cfg *Config) Validate() error {
	return nil
}

func (cfg *Config) PromptUserInput() {
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Print("Enter domain: ")
	scanner.Scan()
	cfg.Domain = scanner.Text()

	fmt.Print("Enter SMTP URI: ")
	scanner.Scan()
	cfg.SmtpURI = scanner.Text()

	fmt.Print("Enter From Email: ")
	scanner.Scan()
	cfg.FromEmail = scanner.Text()

	fmt.Print("Enter From Name: ")
	scanner.Scan()
	cfg.FromName = scanner.Text()

	fmt.Print("Enter ACME Email: ")
	scanner.Scan()
	cfg.AcmeEmail = scanner.Text()
}

func isTTY() bool {
	return term.IsTerminal(int(os.Stdout.Fd()))
}

func randomString(length int) string {
	bytes := make([]byte, length)
	rand.Read(bytes)
	return base64.StdEncoding.EncodeToString(bytes)[:length]
}

func ensureCompose(branch string, deployTestMail, deployTraefik, addTraefikLabels bool) error {
	files := map[string]string{
		"docker-compose.yaml": fmt.Sprintf("https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/%s/docker-compose.yaml", branch),
	}

	if deployTestMail {
		files["distribution/compose/docker-compose.mail-test.yaml"] = fmt.Sprintf("https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/%s/docker-compose.mail-test.yaml", branch)
	}
	if deployTraefik {
		files["distribution/compose/docker-compose.traefik.yaml"] = fmt.Sprintf("https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/%s/distribution/compose/docker-compose.traefik.yaml", branch)
	}
	if addTraefikLabels {
		files["distribution/compose/docker-compose.traefik-labels.yaml"] = fmt.Sprintf("https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/%s/distribution/compose/docker-compose.traefik-labels.yaml", branch)
	}

	for filePath, url := range files {
		if _, err := os.Stat(filePath); errors.Is(err, os.ErrNotExist) {
			if err := downloadFile(filePath, url); err != nil {
				return fmt.Errorf("failed to download %s: %v", filePath, err)
			}
		}
	}
	return nil
}

func downloadFile(filePath, url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if err := os.MkdirAll(strings.TrimSuffix(filePath, "/"+filepath.Base(filePath)), 0o755); err != nil {
		return err
	}

	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func checkDependencies() error {
	for _, cmd := range []string{"docker", "docker-compose"} {
		if _, err := exec.LookPath(cmd); err != nil {
			return fmt.Errorf("missing required command: %s", cmd)
		}
	}

	_, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	return nil
}

func GenerateComposeConfig(cCtx *ucli.Context) error {
	flagBranch := flag.String("branch", defaultBranch, "Git branch to fetch compose files from")
	flagDeployTestMail := flag.Bool("deploy-test-mail", false, "Deploy test mail service")
	flagDeployTraefik := flag.Bool("deploy-traefik", false, "Deploy Traefik")
	flagAddTraefikLabels := flag.Bool("add-traefik-labels", false, "Add Traefik labels to services")
	flagUseHTTPS := flag.Bool("use-https", false, "Use HTTPS")
	flagAcmeEmail := flag.String("acme-email", "", "ACME email for Let's Encrypt")
	flagDomain := flag.String("domain", "", "Domain name")
	flagSmtpURI := flag.String("smtp-uri", "", "SMTP URI")
	flagFromEmail := flag.String("from-email", "", "From email")
	flagFromName := flag.String("from-name", "", "From name")
	flag.Parse()

	cfg := Config{
		DeployTestMail:         *flagDeployTestMail,
		DeployTraefik:          *flagDeployTraefik,
		AddTraefikLabels:       *flagAddTraefikLabels,
		UseHTTPS:               *flagUseHTTPS,
		AcmeEmail:              *flagAcmeEmail,
		Domain:                 *flagDomain,
		SmtpURI:                *flagSmtpURI,
		FromEmail:              *flagFromEmail,
		FromName:               *flagFromName,
		EncryptionKey:          randomString(32),
		CruxPostgresPassword:   randomString(32),
		KratosPostgresPassword: randomString(32),
		KratosSecret:           randomString(32),
		CruxSecret:             randomString(32),
	}

	if err := checkDependencies(); err != nil {
		return err
	}

	if isTTY() {
		cfg.PromptUserInput()
	} else {
		log.Printf("Non-interative session, expecting all flags to be set")
	}

	ensureCompose(*flagBranch, cfg.DeployTestMail, cfg.DeployTraefik, cfg.AddTraefikLabels)
	composeFiles := []string{"docker-compose.yaml"}
	if cfg.DeployTraefik {
		composeFiles = append(composeFiles, "distribution/compose/docker-compose.traefik.yaml")
	}
	if cfg.AddTraefikLabels {
		composeFiles = append(composeFiles, "distribution/compose/docker-compose.traefik-labels.yaml")
	}
	if cfg.DeployTestMail {
		composeFiles = append(composeFiles, "distribution/compose/docker-compose.mail-test.yaml")
	}

	cfg.Compose = strings.Join(composeFiles, ":")

	if err := godotenv.Write(cfg.ToMap(), ".env"); err != nil {
		return err
	}

	return nil
}
