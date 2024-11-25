import { HttpModule } from '@nestjs/axios'
import { Module, forwardRef } from '@nestjs/common'
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import { CruxJwtModule } from 'src/config/jwt.config'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import ContainerModule from '../container/container.module'
import DeployModule from '../deploy/deploy.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import { AGENT_STRATEGY_TYPES } from './agent.connection-strategy.provider'
import AgentController from './agent.grpc.controller'
import AgentService from './agent.service'

@Module({
  imports: [
    HttpModule,
    CruxJwtModule,
    forwardRef(() => ImageModule),
    forwardRef(() => ContainerModule),
    forwardRef(() => DeployModule),
  ],
  exports: [AgentService],
  controllers: [AgentController],
  providers: [
    AgentService,
    PrismaService,
    TeamRepository,
    NotificationTemplateBuilder,
    DomainNotificationService,
    KratosService,
    ...AGENT_STRATEGY_TYPES,
    makeGaugeProvider({
      name: 'agent_online_count',
      help: 'Agent connection count',
    }),
  ],
})
export default class AgentModule {}
