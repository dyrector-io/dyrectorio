import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import { CruxJwtModule } from 'src/config/jwt.config'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import ContainerModule from '../container/container.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import AgentController from './agent.grpc.controller'
import AgentService from './agent.service'

@Module({
  imports: [HttpModule, CruxJwtModule, ImageModule, ContainerModule],
  exports: [AgentService],
  controllers: [AgentController],
  providers: [
    AgentService,
    PrismaService,
    TeamRepository,
    NotificationTemplateBuilder,
    DomainNotificationService,
    KratosService,
    makeGaugeProvider({
      name: 'agent_online_count',
      help: 'Agent connection count',
    }),
  ],
})
export default class AgentModule {}
