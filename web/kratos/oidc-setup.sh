#!/usr/bin/env sh
set +eu

# Define templates for each provider, make sure to not resolve envs here as not all of them might be needed
TEMPLATES_GITLAB="{\"id\":\"gitlab\",\"provider\":\"gitlab\",\"mapper_url\":\"base64://\${OIDC_GITLABHUB_SCHEMA_MAPPER}\",\"client_id\":\"\${TEMPLATE_CLIENT_ID}\",\"client_secret\":\"\${TEMPLATE_CLIENT_SECRET}\",\"scope\":[\"read_user\",\"openid\",\"email\",\"profile\"],\"auth_url\":\"https://gitlab.com/oauth/authorize\",\"token_url\":\"https://gitlab.com/oauth/token\",\"issuer_url\":\"https://gitlab.com\"}"
TEMPLATES_GITHUB="{\"id\":\"github\",\"provider\":\"github\",\"mapper_url\":\"base64://\${OIDC_GITLABHUB_SCHEMA_MAPPER}\",\"client_id\":\"\${TEMPLATE_CLIENT_ID}\",\"client_secret\":\"\${TEMPLATE_CLIENT_SECRET}\",\"scope\":[\"read:user\",\"user:email\"],\"auth_url\":\"https://github.com/login/oauth/authorize\",\"token_url\":\"https://github.com/login/oauth/access_token\",\"issuer_url\":\"https://github.com\"}"
TEMPLATES_GOOGLE="{\"id\":\"google\",\"provider\":\"google\",\"mapper_url\":\"base64://\${OIDC_GOOGLE_SCHEMA_MAPPER}\",\"client_id\":\"\${TEMPLATE_CLIENT_ID}\",\"client_secret\":\"\${TEMPLATE_CLIENT_SECRET}\",\"scope\":[\"openid\",\"email\",\"profile\"],\"auth_url\":\"https://accounts.google.com/o/oauth2/v2/auth\",\"token_url\":\"https://www.googleapis.com/oauth2/v4/token\",\"issuer_url\":\"https://accounts.google.com\"}"
TEMPLATES_AZURE="{\"id\":\"azure\",\"provider\":\"microsoft\",\"mapper_url\":\"base64://\${OIDC_AZURE_SCHEMA_MAPPER}\",\"client_id\":\"\${TEMPLATE_CLIENT_ID}\",\"client_secret\":\"\${TEMPLATE_CLIENT_SECRET}\",\"scope\":[\"openid\",\"email\",\"profile\"],\"microsoft_tenant\":\"common\",\"subject_source\":\"userinfo\"}"

# Checks the given provider environment variables and appends the JSON object to the PROVIDERS variable
# based on the template defined above.
# Arguments: $1 = upper case provider name, $2 = mapper environment variable name
# ClientID env is "OIDC_[provider]_CLIENT_ID", secret env is "OIDC_[provider]_CLIENT_SECRET"
checkProvider() {
    envClientId="OIDC_$1_CLIENT_ID"
    envClientSecret="OIDC_$1_CLIENT_SECRET"

    set +eu # Disable unset variables check as client ID and secret might be unset
    [ -z "$(eval echo \$$envClientId)" ]
    clientIdSet=$?

    [ -z "$(eval echo \$$envClientSecret)" ]
    clientSecretSet=$?
    set -eu

    if [ "$clientIdSet" -ne "$clientSecretSet" ]; then
        echo "$envClientId or $envClientSecret not set"
        exit 1
    fi

    if [ "$clientIdSet" = 1 ] && [ "$clientSecretSet" = 1 ]; then
        set +eu
        mapperValue=$(eval echo \$$2)

        if [ -z "$mapperValue" ]; then
            echo "$2 missing"
            exit 1
        fi
        set -eu

        clientId="$(eval echo \$$envClientId)"
        clientSecret="$(eval echo \$$envClientSecret)"

        templateString=$(eval echo \$TEMPLATES_$1)

        newTemplateString=$(echo $templateString | sed -e "s/\${TEMPLATE_CLIENT_ID}/$clientId/g")
        newTemplateString=$(echo $newTemplateString | sed -e "s/\${TEMPLATE_CLIENT_SECRET}/$clientSecret/g")
        newTemplateString=$(echo $newTemplateString | sed -e "s/\${$2}/$mapperValue/g")

        PROVIDERS="${PROVIDERS}$newTemplateString,"

        echo "$1 OIDC client setup"
    fi
}

PROVIDERS="["

checkProvider "GITLAB" "OIDC_GITLABHUB_SCHEMA_MAPPER"
checkProvider "GITHUB" "OIDC_GITLABHUB_SCHEMA_MAPPER"
checkProvider "GOOGLE" "OIDC_GOOGLE_SCHEMA_MAPPER"
checkProvider "AZURE" "OIDC_AZURE_SCHEMA_MAPPER"

# Strip ',' at the end of PROVIDERS
if [ "${#PROVIDERS}" -gt 1 ]; then
    PROVIDERS="${PROVIDERS::-1}"
    export SELFSERVICE_METHODS_OIDC_ENABLED=true
else
    unset SELFSERVICE_METHODS_OIDC_ENABLED
fi

export SELFSERVICE_METHODS_OIDC_CONFIG_PROVIDERS="${PROVIDERS}]"
