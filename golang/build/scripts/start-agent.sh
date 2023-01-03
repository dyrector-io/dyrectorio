#!/bin/sh

# Multiarchitecture entrypoint
# detects the current cpu arch and starts the agent respectively

# this run in a distroless image so take care, basic executables may not be available

case "$(arch)" in
  "x86_64")
    echo "Starting amd64 agent"
    exec /agent-amd64 "$@"
    ;;
  "aarch64")
    echo "starting arm64 agent"
    exec /agent-arm64 "$@"
    ;;
  * )
    echo "Unsupported architecture: $(arch)"
    exit 1
esac
