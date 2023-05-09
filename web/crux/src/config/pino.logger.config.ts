import pino from 'pino'

const pinoLoggerConfig = {
  pinoHttp: {
    logger: pino({
      customProps: () => ({
        context: 'HTTP',
      }),
      level: process.env.LOG_LEVEL,
      // Added this for further finetuning
      // redact: {
      //   paths: ['req.headers', 'remoteAddress'],
      //   remove: true,
      // },
      transport:
        // Use pino-pretty only in the development environment
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                ignore: 'pid,hostname',
                translateTime: 'mm/dd/yyyy h:MM:ss',
                messageFormat: '[{req.headers.host}{req.url}][{context}] {msg} [{responseTime} ms][{res.statusCode}]',
                errorLikeObjectKeys: ['err', 'error'],
              },
            }
          : undefined,
    }),
  },
}

export default pinoLoggerConfig
