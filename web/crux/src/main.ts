import { ServerCredentials } from '@grpc/grpc-js'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { SwaggerModule } from '@nestjs/swagger'
import { join } from 'path'
import { Logger } from 'nestjs-pino'
import AppModule from './app.module'
import CreatedWithLocationInterceptor from './app/shared/created-with-location.interceptor'
import JwtAuthGuard from './app/token/jwt-auth.guard'
import HttpExceptionFilter from './filters/http.exception-filter'
import UuidValidationGuard from './guards/uuid-params.validation.guard'
import PrismaErrorInterceptor from './interceptors/prisma-error-interceptor'
import createSwaggerConfig from './config/swagger.config'
import DyoWsAdapter from './websockets/dyo.ws.adapter'
import AuditLoggerInterceptor from './interceptors/audit-logger.interceptor'

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

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  const configService = app.get(ConfigService)

  if (configService.get<string>('NODE_ENV') === 'production') {
    app.useLogger(app.get(Logger))
  }

  app.setGlobalPrefix('/api')
  app.enableShutdownHooks()

  // Swagger
  const config = createSwaggerConfig(configService)
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/swagger', app, document)

  const agentOptions = loadGrpcOptions('agent', configService.get<string>('GRPC_AGENT_PORT'))
  const httpOptions = configService.get<string>('HTTP_API_PORT', '1848')

  const authGuard = app.get(JwtAuthGuard)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalGuards(authGuard, app.get(UuidValidationGuard))
  app.useGlobalInterceptors(
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

  await app.startAllMicroservices()
  await app.listen(httpOptions)
}

bootstrap()
