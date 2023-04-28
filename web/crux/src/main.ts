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
    .setDescription('The dyrectorio platform API documentation.')
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
    .addTag(
      'products',
      'There are two kinds of products in dyrectorio: Simple and Complex. Simple products make up one deployable unit without versioning, while Complex products come with multiple rolling or incremental versions. More details in dyrectorio platform [documentation](https://docs.dyrector.io/tutorials/create-your-product).',
    )
    .addTag(
      'versions',
      'Versions belong to products. While Simple Products are technically versionless, they act as a rolling version of a Complex Product.</br></br>The purpose of versions is to separate different variations of your product. They can be either rolling or incremental. One Complex Product can have multiple versions of both types. More details about rolling and incremental versions in dyrectorio platform [documentation](https://docs.dyrector.io/get-started/components#product).',
    )
    .addTag('version/images', "Images make up a Complex Product's version, or a Simple Product.")
    .addTag(
      'registries',
      'Registries are 3rd party registries where the images of versions are located. Learn more about registries in dyrectorio platform [documentation](https://docs.dyrector.io/get-started/components#registry).',
    )
    .addTag(
      'teams',
      'Teams are the shared entity of multiple users. The purpose of teams is to separate users, nodes and products based on their needs within an organization. Team owners can assign roles. More details about teams in dyrectorio platform [documentation](https://docs.dyrector.io/get-started/components#team).',
    )
    .addTag('users/me', 'users/me cover endpoints related to your user profile.')
    .addTag(
      'deployments',
      'Deployments are the process that gets the installation of your versions or Simple Products done on the node of your choice. More details about deployments in dyrectorio platform [documentation](https://docs.dyrector.io/get-started/components#deployment).',
    )
    .addTag(
      'tokens',
      'Tokens are the access tokens that grant you access to a user profile and the teams the profile is a member of.',
    )
    .addTag(
      'nodes',
      'Nodes are the deployment targets. Nodes are registered by installing at least one of the agents - crane for Kubernetes, dagent for Docker. These agents connect the platform to your node. One team can have as many nodes as they like.</br></br>Node installation takes place with Shell or PowerShell scripts, which can be created or revoked. More details in dyrectorio platform [documentation](https://docs.dyrector.io/get-started/components#node).',
    )
    .addTag('audit-log', 'Audit log is a log of team activity generated by the platform.')
    .addTag(
      'health',
      'Health refers to the status of the different services that make up the platform. It can be checked to see if the platform works properly.',
    )
    .addTag(
      'notifications',
      'Notifications are chat notifications in Slack, Discord, and Teams. They send an automated message about deployments, new versions, new nodes, and new users. More details in dyrectorio platform [documentation](https://docs.dyrector.io/tutorials/create-chat-notifications).',
    )
    .addTag(
      'templates',
      'Templates are preset applications that can be turned into a product right away. They can be deployed with minimal configuration. More details about templates in dyrectorio platform [documentation](https://docs.dyrector.io/features/templates).',
    )
    .addTag('dashboard', 'Dashboard summarizes the latest activities of a team.')
    .addTag(
      'storages',
      'Storages are S3 compatible memory storages. They can be used for file injection. More details in dyrectorio platform [documentation](https://docs.dyrector.io/features/storage).',
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
      protoPath: [join(__dirname, '../proto/agent.proto'), join(__dirname, '../proto/common.proto')],
      keepalive: { keepaliveTimeoutMs: HOUR_IN_MS },
      ...agentOptions,
    },
  })

  await app.startAllMicroservices()
  logger.log(`gRPC agent services are running on: ${agentOptions.url}`)

  await app.listen(httpOptions)
  logger.log(`HTTP API service is running on PORT: ${httpOptions}`)
}

bootstrap()
