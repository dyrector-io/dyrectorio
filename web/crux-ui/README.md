# crux-ui

### TLS

Server-side TLS is in use, the server is the `crux` component, the server's public cert is used to provide TLS.

### Install `npm` modules in Apple Silicon

You have to explicitly add the target architecture:
```npm install --target_arch=x64```

### e2e tests
Install headless browser
```npx playwright install```

### run tests
```npm run test:e2e```
