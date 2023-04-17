import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import DeployModule from '../deploy/deploy.module'
import ImageModule from '../image/image.module'
import SharedModule from '../shared/shared.module'
import TeamRepository from '../team/team.repository'
import VersionHttpController from './version.http.controller'
import VersionMapper from './version.mapper'
import VersionService from './version.service'

@Module({
  imports: [ImageModule, HttpModule, SharedModule, DeployModule, AgentModule],
  exports: [VersionService, VersionMapper],
  controllers: [VersionHttpController],
  providers: [
    VersionService,
    VersionMapper,
    PrismaService,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    NotificationTemplateBuilder,
    DomainNotificationService,
    KratosService,
  ],
})
export default class VersionModule {}
