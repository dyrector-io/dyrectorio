import { ServerCredentials } from '@grpc/grpc-js'
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { join } from 'path'
import AppModule from './app.module'
import CreatedWithLocationInterceptor from './app/shared/created-with-location.interceptor'
import JwtAuthGuard from './app/token/jwt-auth.guard'
import HttpExceptionFilter from './filters/http.exception-filter'
import UuidValidationGuard from './guards/uuid-params.validation.guard'
import HttpLoggerInterceptor from './interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from './interceptors/prisma-error-interceptor'
import DyoWsAdapter from './websockets/dyo.ws.adapter'

const HOUR_IN_MS: number = 60 * 60 * 1000

type GrpcOptions = {
  url: string
  credentials: ServerCredentials
}

type GrpcClient = 'api' | 'agent'

const loadGrpcOptions = (certPrefix: GrpcClient, portEnv: string): GrpcOptions => {
  const port = portEnv ? Number(portEnv) : certPrefix === 'agent' ? 5000 : 5001

  return {
    // tls termination occurs at the reverse proxy
    credentials: ServerCredentials.createInsecure(),
    url: `0.0.0.0:${port}`,
  }
}

const parseLogLevelFromEnv = (logger: Logger, logLevelEnv: string, nodeEnv: string): LogLevel[] => {
  const VALID_LOG_LEVEL_VALUES = ['error', 'warn', 'log', 'debug', 'verbose']
  const index = VALID_LOG_LEVEL_VALUES.indexOf(logLevelEnv)

  if (index < 0) {
    logger.warn(`Invalid log level: ${logLevelEnv} Valid values: ${VALID_LOG_LEVEL_VALUES}`)
  }

  const logLevel =
    index >= 0
      ? VALID_LOG_LEVEL_VALUES.slice(0, index + 1)
      : nodeEnv === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug']

  return logLevel as LogLevel[]
}

const bootstrap = async () => {
  const logger: Logger = new Logger('NestBoostrap')
  const app = await NestFactory.create(AppModule, {
    logger: parseLogLevelFromEnv(logger, process.env.LOG_LEVEL, process.env.NODE_ENV),
  })
  const configService = app.get(ConfigService)

  app.enableShutdownHooks()

  const config = new DocumentBuilder()
    .setTitle('dyrectorio platform API')
    .setDescription('The dyrectorio platform API description')
    .setVersion('0.3')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Bearer',
        description: 'Please enter token in following format: ',
      },
      'jwt',
    )
    .build()

  // Swagger
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const agentOptions = loadGrpcOptions('agent', configService.get<string>('GRPC_AGENT_PORT'))
  const apiOptions = loadGrpcOptions('api', configService.get<string>('GRPC_API_PORT'))
  const httpOptions = configService.get<string>('HTTP_API_PORT', '1848')

  const authGuard = app.get(JwtAuthGuard)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalGuards(authGuard, app.get(UuidValidationGuard))
  app.useGlobalInterceptors(
    new HttpLoggerInterceptor(),
    app.get(PrismaErrorInterceptor),
    new CreatedWithLocationInterceptor(),
  )
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.useWebSocketAdapter(new DyoWsAdapter(app, authGuard))

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

  await app.startAllMicroservices()
  logger.log(`gRPC agent services are running on: ${agentOptions.url}`)
  logger.log(`gRPC API services are running on: ${apiOptions.url}`)

  await app.listen(httpOptions)
  logger.log(`HTTP API service is running on PORT: ${httpOptions}`)
}

bootstrap()
