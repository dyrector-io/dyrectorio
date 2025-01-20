import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditMapper from '../audit/audit.mapper'
import ContainerModule from '../container/container.module'
import DeployModule from '../deploy/deploy.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import VersionChainHttpController from './version-chains.http.controller'
import VersionDomainEventListener from './version.domain-event.listener'
import VersionHttpController from './version.http.controller'
import VersionMapper from './version.mapper'
import VersionService from './version.service'
import VersionWebSocketGateway from './version.ws.gateway'

@Module({
  imports: [
    forwardRef(() => ImageModule),
    forwardRef(() => ContainerModule),
    HttpModule,
    forwardRef(() => DeployModule),
    forwardRef(() => AgentModule),
    EditorModule,
    AuditLoggerModule,
  ],
  exports: [VersionService, VersionMapper],
  controllers: [VersionHttpController, VersionChainHttpController],
  providers: [
    VersionService,
    VersionMapper,
    VersionDomainEventListener,
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
