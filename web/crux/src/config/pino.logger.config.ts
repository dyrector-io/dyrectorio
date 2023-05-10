import pino from 'pino'

const pinoLoggerConfig = {
  pinoHttp: {
    logger: pino({
      mixin: () => ({ context: 'HTTP' }),
      level: process.env.LOG_LEVEL,
      redact: {
        paths: ['req.headers.cookie', 'req.remoteAddress', 'req.remotePort', 'res.headers.etag'],
        remove: true,
      },
    }),
  },
}

export default pinoLoggerConfig
