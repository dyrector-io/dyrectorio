/*
Serves as a proxy for other packages allowing these files to be imported from repo root
*/
package reporoot

import (
	_ "embed"
)

//go:embed docker-compose.yaml
var ComposeBase []byte

//go:embed distribution/compose/docker-compose.traefik.yaml
var TraefikCompose []byte

//go:embed distribution/compose/docker-compose.traefik-tls.yaml
var TraefikTLSCompose []byte

//go:embed distribution/compose/docker-compose.traefik-labels.yaml
var TraefikLabelsCompose []byte

//go:embed distribution/compose/docker-compose.traefik-labels-tls.yaml
var TraefikLabelsTLSCompose []byte

//go:embed distribution/compose/docker-compose.mail-test.yaml
var MailCompose []byte
