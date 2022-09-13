GOSEC=v2.12.0
GOLANGCI=v1.46.2
GOSWAG=v1.8.3

.PHONY: install-go-tools
install-go-tools: ##
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@${GOLANGCI} && \
	go install github.com/swaggo/swag/cmd/swag@${GOSWAG} && \
	go install github.com/securego/gosec/v2/cmd/gosec@${GOSEC}

.PHONY: security
security: # running gosec for static code analysis for bugs and leaks
	gosec ./...

.PHONY: lint
lint: # golangci for linting
	golangci-lint run  ./... --timeout=3m
