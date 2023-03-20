import DomainNotificationService from 'src/services/domain.notification.service'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import DeployModule from '../deploy/deploy.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import VersionMapper from './version.mapper'
import VersionService from './version.service'
import VersionHttpController from './version.http.controller'

@Module({
  imports: [DeployModule, ImageModule, HttpModule],
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
