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
      transport:
        // Use pino-pretty only in the development environment
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                ignore: 'pid,hostname',
                translateTime: 'yyyy-mm-dd h:MM:ss',
                messageFormat: '[{res.statusCode} | {context} | {req.headers.host}{req.url}] {msg} [{responseTime} ms]',
                errorLikeObjectKeys: ['err', 'error'],
              },
            }
          : undefined,
    }),
  },
}

export default pinoLoggerConfig
