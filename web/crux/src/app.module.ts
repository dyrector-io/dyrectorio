import { TeamRepository } from './app/team/team.repository'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AgentModule } from './app/agent/agent.module'
import { AuditModule } from './app/audit/audit.module'
import { DeployModule } from './app/deploy/deploy.module'
import { HealthModule } from './app/health/health.module'
import { ImageModule } from './app/image/image.module'
import { NodeModule } from './app/node/node.module'
import { ProductModule } from './app/product/product.module'
import { RegistryModule } from './app/registry/registry.module'
import { TeamModule } from './app/team/team.module'
import { VersionModule } from './app/version/version.module'
import { ShutdownService } from './application.shutdown.service'
import { InterceptorGrpcHelperProvider } from './interceptors/helper.interceptor'
import { PrismaErrorInterceptor } from './interceptors/prisma-error-interceptor'
import { GrpcContextLogger } from './interceptors/grpc-context-logger.interceptor'
import { AuditLoggerInterceptor } from './interceptors/audit-logger.interceptor'
import { PrismaService } from './config/prisma.service'

@Module({
  imports: [
    ProductModule,
    RegistryModule,
    NodeModule,
    VersionModule,
    ImageModule,
    TeamModule,
    DeployModule,
    AgentModule,
    AuditModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    TeamRepository,
    ShutdownService,
    InterceptorGrpcHelperProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcContextLogger,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggerInterceptor,
    },
  ],
})
export class AppModule {}
