import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import DeployModule from '../deploy/deploy.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import NodeContainerHttpController from './node.container.http.controller'
import NodeContainerWebSocketGateway from './node.container.ws.gateway'
import NodeHttpController from './node.http.controller'
import NodeMapper from './node.mapper'
import NodeService from './node.service'
import NodeWebSocketGateway from './node.ws.gateway'

@Module({
  imports: [AgentModule, TeamModule, HttpModule, AuditLoggerModule, DeployModule],
  exports: [NodeMapper],
  controllers: [NodeHttpController, NodeContainerHttpController],
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
  ],
})
export default class NodeModule {}
