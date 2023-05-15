#!/bin/sh

set -eu

package_json_path=$1
commit_hash=$2
commit_short_hash=$( git rev-parse --short $commit_hash )

version=$( cat $package_json_path | jq -r .version )
version=${version}-${commit_short_hash}

jq --arg version $version -r '.version |= $version' $package_json_path > new-package.json
mv new-package.json $package_json_path

echo package.json updated to version $version
