#!/usr/bin/env sh
set +eu

[ -z "${OIDC_GILAB_CLIENT_ID:-}" ]
GITLAB_CLIENT_ID_SET=$?
[ -z "${OIDC_GILAB_CLIENT_SECRET-}" ]
GITLAB_CLIENT_SECRET_SET=$?

[ -z "${OIDC_GITHUB_CLIENT_ID-}" ]
GITHUB_CLIENT_ID_SET=$?
[ -z "${OIDC_GITHUB_CLIENT_SECRET-}" ]
GITHUB_CLIENT_SECRET_SET=$?

[ -z "${OIDC_GOOGLE_CLIENT_ID-}" ]
GOOGLE_CLIENT_ID_SET=$?
[ -z "${OIDC_GOOGLE_CLIENT_SECRET-}" ]
GOOGLE_CLIENT_SECRET_SET=$?

[ -z "${OIDC_AZURE_CLIENT_ID-}" ]
AZURE_CLIENT_ID_SET=$?
[ -z "${OIDC_AZURE_CLIENT_SECRET-}" ]
AZURE_CLIENT_SECRET_SET=$?

set -eu

if [ "$GITLAB_CLIENT_ID_SET" -ne "$GITLAB_CLIENT_SECRET_SET" ]
then
    echo "OIDC_GILAB_CLIENT_ID or OIDC_GILAB_CLIENT_SECRET not set"
    exit 1
fi

if [ "$GITHUB_CLIENT_ID_SET" -ne "$GITHUB_CLIENT_SECRET_SET" ]
then
    echo "OIDC_GITHUB_CLIENT_ID or OIDC_GITHUB_CLIENT_SECRET not set"
    exit 1
fi

if [ "$GOOGLE_CLIENT_ID_SET" -ne "$GOOGLE_CLIENT_SECRET_SET" ]
then
    echo "OIDC_GOOGLE_CLIENT_ID or OIDC_GOOGLE_CLIENT_SECRET not set"
    exit 1
fi

if [ "$AZURE_CLIENT_ID_SET" -ne "$AZURE_CLIENT_SECRET_SET" ]
then
    echo "OIDC_AZURE_CLIENT_ID or OIDC_AZURE_CLIENT_SECRET not set"
    exit 1
fi

PROVIDERS="["

if [[ "$GITLAB_CLIENT_ID_SET" -eq 1 ]] && [[ "$GITLAB_CLIENT_SECRET_SET" -eq 1 ]]
then
    if [ -z "${OIDC_GITLABHUB_SCHEMA_MAPPER:-}" ]
    then
        echo "OIDC_GITLABHUB_SCHEMA_MAPPER missing"
        exit 1
    fi

    PROVIDERS="${PROVIDERS}{\"id\":\"gitlab\",\"provider\":\"gitlab\",\"mapper_url\":\"base64://${OIDC_GITLABHUB_SCHEMA_MAPPER}\",\"client_id\":\"${OIDC_GILAB_CLIENT_ID}\",\"client_secret\":\"${OIDC_GILAB_CLIENT_SECRET}\",\"scope\":[\"read_user\",\"openid\",\"email\",\"profile\"],\"auth_url\":\"https://gitlab.com/oauth/authorize\",\"token_url\":\"https://gitlab.com/oauth/token\",\"issuer_url\":\"https://gitlab.com\"},"
fi

if [[ "$GITHUB_CLIENT_ID_SET" -eq 1 ]] && [[ "$GITHUB_CLIENT_SECRET_SET" -eq 1 ]]
then
    if [ -z "${OIDC_GITLABHUB_SCHEMA_MAPPER:-}" ]
    then
        echo "OIDC_GITLABHUB_SCHEMA_MAPPER missing"
        exit 1
    fi

    PROVIDERS="${PROVIDERS}{\"id\":\"github\",\"provider\":\"github\",\"mapper_url\":\"base64://${OIDC_GITLABHUB_SCHEMA_MAPPER}\",\"client_id\":\"${OIDC_GITHUB_CLIENT_ID}\",\"client_secret\":\"${OIDC_GITHUB_CLIENT_SECRET}\",\"scope\":[\"read:user\",\"user:email\"],\"auth_url\":\"https://github.com/login/oauth/authorize\",\"token_url\":\"https://github.com/login/oauth/access_token\",\"issuer_url\":\"https://github.com\"},"
fi

if [[ "$GOOGLE_CLIENT_ID_SET" -eq 1 ]] && [[ "$GOOGLE_CLIENT_SECRET_SET" -eq 1 ]]
then
    if [ -z "${OIDC_GOOGLE_SCHEMA_MAPPER:-}" ]
    then
        echo "OIDC_GOOGLE_SCHEMA_MAPPER missing"
        exit 1
    fi

    PROVIDERS="${PROVIDERS}{\"id\":\"google\",\"provider\":\"google\",\"mapper_url\":\"base64://${OIDC_GOOGLE_SCHEMA_MAPPER}\",\"client_id\":\"${OIDC_GOOGLE_CLIENT_ID}\",\"client_secret\":\"${OIDC_GOOGLE_CLIENT_SECRET}\",\"scope\":[\"openid\",\"email\",\"profile\"],\"auth_url\":\"https://accounts.google.com/o/oauth2/v2/auth\",\"token_url\":\"https://www.googleapis.com/oauth2/v4/token\",\"issuer_url\":\"https://accounts.google.com\"},"
fi

if [[ "$AZURE_CLIENT_ID_SET" -eq 1 ]] && [[ "$AZURE_CLIENT_SECRET_SET" -eq 1 ]]
then
    if [ -z "${OIDC_AZURE_SCHEMA_MAPPER:-}" ]
    then
        echo "OIDC_AZURE_SCHEMA_MAPPER missing"
        exit 1
    fi

    PROVIDERS="${PROVIDERS}{\"id\":\"azure\",\"provider\":\"microsoft\",\"mapper_url\":\"base64://${OIDC_AZURE_SCHEMA_MAPPER}\",\"client_id\":\"${OIDC_AZURE_CLIENT_ID}\",\"client_secret\":\"${OIDC_AZURE_CLIENT_SECRET}\",\"scope\":[\"openid\",\"email\",\"profile\"],\"microsoft_tenant\":\"common\",\"subject_source\":\"userinfo\"},"
fi

if [[ "${#PROVIDERS}" -gt 1 ]]
then
    PROVIDERS="${PROVIDERS::-1}"
    export SELFSERVICE_METHODS_OIDC_ENABLED=true
else
    unset SELFSERVICE_METHODS_OIDC_ENABLED
fi

export SELFSERVICE_METHODS_OIDC_CONFIG_PROVIDERS="${PROVIDERS}]"
