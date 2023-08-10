import { ServerCredentials } from '@grpc/grpc-js'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { SwaggerModule } from '@nestjs/swagger'
import { Logger as PinoLogger } from 'nestjs-pino'
import { join } from 'path'
import AppModule from './app.module'
import AuditLoggerInterceptor from './app/audit.logger/audit.logger.interceptor'
import { metricsServerBootstrap } from './app/metrics/metrics.server'
import JwtAuthGuard from './app/token/jwt-auth.guard'
import createSwaggerConfig from './config/swagger.config'
import HttpExceptionFilter from './filters/http.exception-filter'
import TeamAccessGuard from './guards/team-access.guard'
import UuidValidationGuard from './guards/uuid-params.validation.guard'
import CreatedWithLocationInterceptor from './interceptors/created-with-location.interceptor'
import HttpLoggerInterceptor from './interceptors/http.logger.interceptor'
import PrismaErrorInterceptor from './interceptors/prisma-error-interceptor'
import prismaBootstrap from './services/prisma.bootstrap'
import { PRODUCTION } from './shared/const'
import DyoWsAdapter from './websockets/dyo.ws.adapter'

const HOUR_IN_MS: number = 60 * 60 * 1000

type GrpcOptions = {
  url: string
  credentials: ServerCredentials
}

const loadGrpcOptions = (portEnv: string): GrpcOptions => {
  const port = portEnv ? Number(portEnv) : 5000

  return {
    // tls termination occurs at the reverse proxy
    credentials: ServerCredentials.createInsecure(),
    url: `0.0.0.0:${port}`,
  }
}

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    // Using Nestjs Logger Service for default logging
    logger: new Logger(),
  })

  const configService = app.get(ConfigService)
  app.setGlobalPrefix('/api')
  app.enableShutdownHooks()

  // If it's in production, we inject the PinoLogger Logger Service instead of the default one
  // because we need to log in JSON format to stdout
  if (configService.get<string>('NODE_ENV') === PRODUCTION) {
    app.useLogger(app.get(PinoLogger))
  }

  // Swagger
  const config = createSwaggerConfig(configService)
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/swagger', app, document)

  const agentOptions = loadGrpcOptions(configService.get<string>('GRPC_AGENT_PORT'))
  const httpOptions = configService.get<string>('HTTP_API_PORT', '1848')
  const metricOptions = configService.get<number>('METRICS_API_PORT', 0)

  const authGuard = app.get(JwtAuthGuard)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalGuards(authGuard, app.get(TeamAccessGuard), app.get(UuidValidationGuard))
  app.useGlobalInterceptors(
    new HttpLoggerInterceptor(),
    app.get(PrismaErrorInterceptor),
    new CreatedWithLocationInterceptor(),
    app.get(AuditLoggerInterceptor),
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

  await prismaBootstrap(app)

  if (metricOptions > 0) {
    await metricsServerBootstrap(app, metricOptions)
  }

  await app.startAllMicroservices()
  await app.listen(httpOptions)
}

bootstrap()
