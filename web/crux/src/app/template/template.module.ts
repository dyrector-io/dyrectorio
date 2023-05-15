import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService from 'src/services/template.file.service'
import KratosService from 'src/services/kratos.service'
import AuditLoggerService from 'src/shared/service/audit.logger.service'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import ProductModule from '../product/product.module'
import TemplateService from './template.service'
import TemplateHttpController from './template.http.controller'
import VersionModule from '../version/version.module'
import TeamModule from '../team/team.module'
import RegistryModule from '../registry/registry.module'
import ImageModule from '../image/image.module'
import AgentModule from '../agent/agent.module'
import DeployModule from '../deploy/deploy.module'
import TeamRepository from '../team/team.repository'

@Module({
  imports: [
    HttpModule,
    ProductModule,
    VersionModule,
    TeamModule,
    RegistryModule,
    ImageModule,
    AgentModule,
    DeployModule,
  ],
  exports: [TemplateService],
  controllers: [TemplateHttpController],
  providers: [
    TemplateService,
    PrismaService,
    TemplateFileService,
    KratosService,
    TeamRepository,
    AuditLoggerService,
    AuditLoggerInterceptor,
  ],
})
export default class TemplateModule {}
