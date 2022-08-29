import { ServerCredentials } from '@grpc/grpc-js'
import { INestApplication, Logger, LogLevel } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { AppModule } from './app.module'
import { ShutdownService } from './application.shutdown.service'
import { getServerCredentials } from './shared/cert'

const HOUR_IN_MS: number = 60 * 60 * 1000

type GrpcOptions = {
  url: string
  credentials: ServerCredentials
}

type GrpcCertPrefix = 'api' | 'agent'

const loadGrpcOptions = (
  app: INestApplication,
  certPrefix: GrpcCertPrefix,
  portEnv: string,
  insecureEnv: string,
): GrpcOptions => {
  const port = portEnv ? parseInt(portEnv) : certPrefix === 'agent' ? 5000 : 5001

  const certPairs =
    insecureEnv === 'true'
      ? null
      : getServerCredentials(certPrefix, () => {
          app.get(ShutdownService).subscribeToShutdown(() => app.close())
        })

  return {
    credentials: certPairs ? ServerCredentials.createSsl(null, certPairs, false) : ServerCredentials.createInsecure(),
    url: `0.0.0.0:${port}`,
  }
}

const parseLogLevelFromEnv = (logLevelEnv: string): LogLevel[] => {
  const VALID_LOG_LEVEL_VALUES = ['error', 'warn', 'log', 'debug', 'verbose']

  const index = VALID_LOG_LEVEL_VALUES.indexOf(logLevelEnv)
  if (index < 0) {
    return process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug']
  }

  return VALID_LOG_LEVEL_VALUES.slice(0, index) as LogLevel[]
}

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: parseLogLevelFromEnv(process.env.LOG_LEVEL),
  })

  app.enableShutdownHooks()

  const agentOptions = loadGrpcOptions(app, 'agent', process.env.GRPC_AGENT_PORT, process.env.GRPC_AGENT_INSECURE)
  const apiOptions = loadGrpcOptions(app, 'api', process.env.GRPC_API_PORT, process.env.GRPC_API_INSECURE)

  // agent
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['agent'],
      protoPath: [
        join(__dirname, '../proto/crux.proto'),
        join(__dirname, '../proto/agent.proto'),
        join(__dirname, '../proto/common.proto'),
      ],
      keepalive: { keepaliveTimeoutMs: HOUR_IN_MS },
      ...agentOptions,
    },
  })

  // API
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: ['crux'],
        protoPath: [join(__dirname, '../proto/crux.proto'), join(__dirname, '../proto/common.proto')],
        keepalive: { keepaliveTimeoutMs: HOUR_IN_MS },
        ...apiOptions,
      },
    },
    { inheritAppConfig: true },
  )

  const logger: Logger = new Logger('NestBoostrap')
  await app.startAllMicroservices()

  logger.log(`gRPC agent services are running on: ${agentOptions.url}`)
  logger.log(`gRPC API services are running on: ${apiOptions.url}`)
}

bootstrap()
