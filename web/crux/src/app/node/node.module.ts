import KratosService from 'src/services/kratos.service'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import { HttpModule } from '@nestjs/axios'
import DomainNotificationService from 'src/services/domain.notification.service'
import AgentModule from '../agent/agent.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import NodeController from './node.controller'
import NodeMapper from './node.mapper'
import NodeService from './node.service'

@Module({
  imports: [AgentModule, TeamModule, HttpModule],
  exports: [],
  controllers: [NodeController],
  providers: [
    PrismaService,
    NodeService,
    NodeMapper,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    DomainNotificationService,
    KratosService,
  ],
})
export default class NodeModule {}
