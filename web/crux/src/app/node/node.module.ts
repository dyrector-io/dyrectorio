import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
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
import SharedModule from '../shared/shared.module'

@Module({
  imports: [AgentModule, TeamModule, HttpModule, SharedModule],
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
  ],
})
export default class NodeModule {}
