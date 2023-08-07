import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditMapper from '../audit/audit.mapper'
import DeployModule from '../deploy/deploy.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import VersionHttpController from './version.http.controller'
import VersionMapper from './version.mapper'
import VersionService from './version.service'
import VersionWebSocketGateway from './version.ws.gateway'

@Module({
  imports: [ImageModule, HttpModule, DeployModule, AgentModule, EditorModule, AuditLoggerModule],
  exports: [VersionService, VersionMapper],
  controllers: [VersionHttpController],
  providers: [
    VersionService,
    VersionMapper,
    PrismaService,
    TeamRepository,
    NotificationTemplateBuilder,
    DomainNotificationService,
    KratosService,
    VersionWebSocketGateway,
    AuditMapper,
  ],
})
export default class VersionModule {}
