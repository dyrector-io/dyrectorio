import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'
import { LoggerModule } from 'nestjs-pino'
import AgentModule from './app/agent/agent.module'
import AuditModule from './app/audit/audit.module'
import ConfigBundleModule from './app/config.bundle/config.bundle.module'
import DashboardModule from './app/dashboard/dashboard.module'
import DeployModule from './app/deploy/deploy.module'
import HealthModule from './app/health/health.module'
import ImageModule from './app/image/image.module'
import NodeModule from './app/node/node.module'
import NotificationModule from './app/notification/notification.module'
import ProjectModule from './app/project/project.module'
import QualityAssuranceModule from './app/quality.assurance/quality-assurance.module'
import RegistryModule from './app/registry/registry.module'
import StorageModule from './app/storage/storage.module'
import TeamModule from './app/team/team.module'
import TemplateModule from './app/template/template.module'
import VersionModule from './app/version/version.module'
import appConfig from './config/app.config'
import pinoLoggerConfig from './config/pino.logger.config'
import TeamAccessGuard from './guards/team-access.guard'
import UuidValidationGuard from './guards/uuid-params.validation.guard'
import EmailModule from './mailer/email.module'
import ShutdownService from './services/application.shutdown.service'
import PrismaService from './services/prisma.service'
import PipelineModule from './app/pipeline/pipeline.module'

const imports = [
  ProjectModule,
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
  PipelineModule,
  ConfigBundleModule,
  ConfigModule.forRoot(appConfig),
  EmailModule,
  QualityAssuranceModule,
  {
    ...PrometheusModule.register(),
    controllers: [], // Found no other way to unset the default controller
  },
]

if (process.env.NODE_ENV === 'production') {
  imports.push(LoggerModule.forRoot(pinoLoggerConfig))
}

@Module({
  imports,
  controllers: [],
  providers: [PrismaService, ShutdownService, UuidValidationGuard, TeamAccessGuard, QualityAssuranceModule],
})
export default class AppModule {}
