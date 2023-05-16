import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import { LoggerModule } from 'nestjs-pino'
import AgentModule from './app/agent/agent.module'
import AuditModule from './app/audit/audit.module'
import DashboardModule from './app/dashboard/dashboard.module'
import DeployModule from './app/deploy/deploy.module'
import HealthModule from './app/health/health.module'
import ImageModule from './app/image/image.module'
import MetricsController from './app/metrics/metrics.controller'
import NodeModule from './app/node/node.module'
import NotificationModule from './app/notification/notification.module'
import ProductModule from './app/product/product.module'
import RegistryModule from './app/registry/registry.module'
import StorageModule from './app/storage/storage.module'
import TeamModule from './app/team/team.module'
import TemplateModule from './app/template/template.module'
import VersionModule from './app/version/version.module'
import ShutdownService from './services/application.shutdown.service'
import EmailModule from './mailer/email.module'
import PrismaService from './services/prisma.service'
import UuidValidationGuard from './guards/uuid-params.validation.guard'
import appConfig from './config/app.config'
import pinoLoggerConfig from './config/pino.logger.config'

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
    NotificationModule,
    TemplateModule,
    DashboardModule,
    StorageModule,
    ConfigModule.forRoot(appConfig),
    EmailModule,
    PrometheusModule.register({
      controller: MetricsController,
    }),
    LoggerModule.forRoot(pinoLoggerConfig),
  ],
  controllers: [],
  providers: [PrismaService, ShutdownService, UuidValidationGuard],
})
export default class AppModule {}
