FROM ghcr.io/dyrector-io/mirror/nginx:mainline-stable

LABEL "io.dyrector.cap.network.v1" '{"ports": [{"listening": 80, "exposed": true}]}'
