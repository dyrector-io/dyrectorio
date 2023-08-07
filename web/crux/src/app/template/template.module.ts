import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import TemplateFileService from 'src/services/template.file.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import DeployModule from '../deploy/deploy.module'
import ImageModule from '../image/image.module'
import ProjectModule from '../project/project.module'
import RegistryModule from '../registry/registry.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import TemplateHttpController from './template.http.controller'
import TemplateService from './template.service'

@Module({
  imports: [
    HttpModule,
    ProjectModule,
    VersionModule,
    TeamModule,
    RegistryModule,
    ImageModule,
    AgentModule,
    DeployModule,
    AuditLoggerModule,
  ],
  exports: [TemplateService],
  controllers: [TemplateHttpController],
  providers: [TemplateService, PrismaService, TemplateFileService, KratosService, TeamRepository],
})
export default class TemplateModule {}
