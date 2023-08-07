import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import RecaptchaService from 'src/app/team/recaptcha.service'
import EmailBuilder from 'src/builders/email.builder'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import EmailModule from 'src/mailer/email.module'
import EmailService from 'src/mailer/email.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import TeamHttpController from './team.http.controller'
import TeamMapper from './team.mapper'
import TeamRepository from './team.repository'
import TeamService from './team.service'
import UserHttpController from './user.http.controller'

@Module({
  imports: [HttpModule, EmailModule, AuditLoggerModule],
  exports: [TeamService],
  controllers: [TeamHttpController, UserHttpController],
  providers: [
    TeamService,
    TeamRepository,
    PrismaService,
    EmailService,
    KratosService,
    TeamMapper,
    EmailBuilder,
    NotificationTemplateBuilder,
    DomainNotificationService,
    RecaptchaService,
  ],
})
export default class TeamModule {}
