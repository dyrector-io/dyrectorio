FROM nginx:latest

LABEL "io.dyrector.cap.network.v1" '{"ports": [{"listening": 80, "exposed": true}]}'
