import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import EmailService from 'src/services/email.service'
import KratosService from 'src/services/kratos.service'
import EmailBuilder from 'src/builders/email.builder'
import { HttpModule } from '@nestjs/axios'
import DomainNotificationService from 'src/services/domain.notification.service'
import TeamService from './team.service'
import TeamRepository from './team.repository'
import TeamMapper from './team.mapper'
import TeamController from './team.controller'

@Module({
  imports: [HttpModule],
  exports: [TeamRepository],
  controllers: [TeamController],
  providers: [
    TeamService,
    TeamRepository,
    PrismaService,
    EmailService,
    KratosService,
    TeamMapper,
    InterceptorGrpcHelperProvider,
    EmailBuilder,
    DomainNotificationService,
  ],
})
export default class TeamModule {}
