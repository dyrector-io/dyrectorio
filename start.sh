#!/bin/bash

# Function to generate a random string
random_string() {
    openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32
}

# Ensure compose files exist
ensure_compose() {
  if [ -z "$BRANCH" ]; then
    BRANCH="feat/simplified-install-script"
  fi
  [ ! -f ./docker-compose.yaml ] && wget "https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/$BRANCH/docker-compose.yaml"
  [ "$DEPLOY_TEST_MAIL" == "y" ] && [ ! -f ./distrib/compose/docker-compose.mail.yaml ] && mkdir -p ./distrib/compose && wget "https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/$BRANCH/docker-compose.mail.yaml" -O ./distrib/compose/docker-compose.mail.yaml
  [ "$DEPLOY_TRAEFIK" == "y" ] && [ ! -f ./distrib/compose/docker-compose.traefik.yaml ] && mkdir -p ./distrib/compose && wget "https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/$BRANCH/distrib/compose/docker-compose.traefik.yaml" -O ./distrib/compose/docker-compose.traefik.yaml
  [ "$ADD_TRAEFIK_LABELS" == "y" ] && [ ! -f ./distrib/compose/docker-compose.traefik-labels.yaml ] && mkdir -p ./distrib/compose && wget "https://raw.githubusercontent.com/dyrector-io/dyrectorio/refs/heads/$BRANCH/distrib/compose/docker-compose.traefik-labels.yaml" -O ./distrib/compose/docker-compose.traefik-labels.yaml
}

# Check if running in an interactive terminal
if [ -t 0 ]; then
    INTERACTIVE=true
else
    INTERACTIVE=false
    if [ -z "$#" ]; then
      echo "Error, no paramters were defined and running the script non-interactively" >&2
      echo "Params: --add-traefik-labels --deploy-traefik --deploy-test-mail --domain --smtp-uri --from-email --from-name --use-https --acme-email"
      exit 1
    fi
fi


# Check if required commands exist
dependencies=("docker" "docker-compose" "openssl")
for cmd in "${dependencies[@]}"; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "Error: Required command '$cmd' not found. Please install it." >&2
        exit 1
    fi
done

# Check if Docker daemon is running
if ! docker info &>/dev/null; then
    echo "Error: Docker daemon is not running. Please start Docker and try again." >&2
    exit 1
fi

# Read parameters from command line arguments
# This means some could be passed as a parameter, while others are promted interactively
while [[ $# -gt 0 ]]; do
    case $1 in
        --add-traefik-labels) ADD_TRAEFIK_LABELS="$2"; shift 2;;
        --deploy-test-mail) DEPLOY_TEST_MAIL="$2"; shift 2;;
        --deploy-traefik) DEPLOY_TRAEFIK="$2"; shift 2;;
        --domain) DOMAIN="$2"; shift 2;;
        --smtp-uri) SMTP_URI="$2"; shift 2;;
        --from-email) FROM_EMAIL="$2"; shift 2;;
        --from-name) FROM_NAME="$2"; shift 2;;
        --use-https) USE_HTTPS="$2"; shift 2;;
        --acme-email) ACME_EMAIL="$2"; shift 2;;
        --branch) BRANCH="$2"; shift 2;;
        *) echo "Unknown parameter: $1"; exit 1;;
    esac
done

# If not interactive, ensure all required values are set
if [ "$INTERACTIVE" == "false" ]; then
    MISSING_VALUES=false
    for VAR in DOMAIN SMTP_URI FROM_EMAIL FROM_NAME; do
        if [ -z "${!VAR}" ]; then
            echo "Error: Missing required value for $VAR and not running interactively."
            MISSING_VALUES=true
        fi
    done

    if [ "$MISSING_VALUES" == "true" ]; then
        exit 1
    fi
else
  # Interactive mode

  echo "Welcome to the interactive dyrector.io config generator"
  echo "We are about to generate the minimal config and compose files to get started"

  read -p "Deploy Traefik?
Choose no if you have Traefik running already or you have other preferences (y/n) " DEPLOY_TRAEFIK
  if [ "$DEPLOY_TRAEFIK" == "n" ]; then
  read -p "Add Traefik labels to services? (y/n) " ADD_TRAEFIK_LABELS
  else
    # deploying Traafik and not adding labels makes no sense
    ADD_TRAEFIK_LABELS="y"
  fi
  read -p "Deploy test mail service (mailslurper demo/testing only, port 4436)? (y/n) " DEPLOY_TEST_MAIL

  # Compose concatenation for extra features
  COMPOSE_FILE="docker-compose.yaml"
  [ "$DEPLOY_TRAEFIK" == "y" ] && COMPOSE_FILE+=":distrib/compose/docker-compose.traefik.yaml"
  [ "$ADD_TRAEFIK_LABELS" == "y" ] && COMPOSE_FILE+=":distrib/compose/docker-compose.traefik-labels.yaml"
  [ "$DEPLOY_TEST_MAIL" == "y" ] && COMPOSE_FILE+=":distrib/compose/docker-compose.mail.yaml"

  if [ -z "$DOMAIN" ]; then
      read -p "Enter domain (dyo.yourdomain.com): " DOMAIN
  fi

  # Handle mail configuration
  if [ "$DEPLOY_TEST_MAIL" == "y" ]; then
      SMTP_URI=${SMTP_URI:-"smtps://test:test@mailslurper:1025/?skip_ssl_verify=true&legacy_ssl=true"}
      FROM_EMAIL=${FROM_EMAIL:-"demo@demo.com"}
      FROM_NAME=${FROM_NAME:-"demo-dyrector.io"}
  else
      if [ -z "$SMTP_URI" ]; then
          read -p "Enter SMTP URI: " SMTP_URI
      fi
      if [ -z "$FROM_EMAIL" ]; then
          read -p "Enter FROM_EMAIL: " FROM_EMAIL
      fi
      if [ -z "$FROM_NAME" ]; then
          read -p "Enter FROM_NAME: " FROM_NAME
      fi
  fi

  if [ -z "$USE_HTTPS" ]; then
      read -p "Use HTTPS? (y/n): " USE_HTTPS
  fi
  if [ "$USE_HTTPS" == "y" ]; then
      EXTERNAL_PROTO="https"
      if [ -z "$ACME_EMAIL" ]; then
          read -p "Enter ACME email (Let's Encrypt email): " ACME_EMAIL
      fi
  else
      EXTERNAL_PROTO="http"
      ACME_EMAIL=""
  fi
fi

# Generating secrets
ENCRYPTION_SECRET_KEY=$(random_string)
CRUX_POSTGRES_PASSWORD=$(random_string)
KRATOS_POSTGRES_PASSWORD=$(random_string)
KRATOS_SECRET=$(random_string)
CRUX_SECRET=$(random_string)

ensure_compose

cat > .env <<EOF
COMPOSE_FILE=$COMPOSE_FILE
DOMAIN=$DOMAIN
SMTP_URI=$SMTP_URI
FROM_EMAIL=$FROM_EMAIL
FROM_NAME="$FROM_NAME"
EXTERNAL_PROTO=$EXTERNAL_PROTO
ACME_EMAIL=$ACME_EMAIL
ENCRYPTION_SECRET_KEY=$ENCRYPTION_SECRET_KEY
CRUX_POSTGRES_PASSWORD=$CRUX_POSTGRES_PASSWORD
KRATOS_POSTGRES_PASSWORD=$KRATOS_POSTGRES_PASSWORD
KRATOS_SECRET=$KRATOS_SECRET
CRUX_SECRET=$CRUX_SECRET
EOF

docker compose up -d
