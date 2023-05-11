import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerService from 'src/shared/audit.logger.service'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import AgentModule from '../agent/agent.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import NodeContainerWebSocketGateway from './node.container.ws.gateway'
import NodeGlobalContainerHttpController from './node.global-container.http.controller'
import NodeHttpController from './node.http.controller'
import NodeMapper from './node.mapper'
import NodePrefixContainerHttpController from './node.prefix-container.http.controller'
import NodeService from './node.service'
import NodeWebSocketGateway from './node.ws.gateway'

@Module({
  imports: [AgentModule, TeamModule, HttpModule],
  exports: [NodeMapper],
  controllers: [NodeHttpController, NodePrefixContainerHttpController, NodeGlobalContainerHttpController],
  providers: [
    PrismaService,
    NodeService,
    NodeMapper,
    TeamRepository,
    NotificationTemplateBuilder,
    DomainNotificationService,
    KratosService,
    NodeWebSocketGateway,
    NodeContainerWebSocketGateway,
    AuditLoggerInterceptor,
    AuditLoggerService,
  ],
})
export default class NodeModule {}
