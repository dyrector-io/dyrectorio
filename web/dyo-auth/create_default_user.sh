#!/bin/sh

if [ -z "$1" ]
then
    echo 'No e-mail address supplied.'
    exit -1
fi

url='http://localhost:9434'
if [ -z "$2" ]
then
  echo "No url was provided, using $url"
else
  url=$2
  echo "Using url $url"
fi

# Create user payload
payload='{
  "schema_id": "default",
  "traits": {
    "email": "'$1'"
  }
}'

# Call user creation API
resp=$(curl --request POST -sL \
    --header "Content-Type: application/json" \
    --request POST \
    --data "$payload" \
    $url/identities)  

id=`echo $resp | jq -r '.id'`

# Create recovery link payload
payload='{
  "expires_in": "12h",
  "identity_id": "'$id'"
}'

# Call recovery ling API
resp=$(curl --request POST -sL \
    --header "Content-Type: application/json" \
    --request POST \
    --data "$payload" \
    $url/recovery/link)
 

link=`echo $resp | jq -r '.recovery_link'`
echo $link
