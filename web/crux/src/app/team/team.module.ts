import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import EmailBuilder from 'src/builders/email.builder'
import NotificationTemplateBuilder from 'src/builders/notification.template.builder'
import EmailModule from 'src/mailer/email.module'
import EmailService from 'src/mailer/email.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerService from 'src/shared/audit.logger.service'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import RecaptchaService from 'src/shared/service/recaptcha.service'
import TeamHttpController from './team.http.controller'
import TeamMapper from './team.mapper'
import TeamService from './team.service'
import UserHttpController from './user.http.controller'
import TeamRepository from './team.repository'

@Module({
  imports: [HttpModule, EmailModule],
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
    AuditLoggerService,
    AuditLoggerInterceptor,
    RecaptchaService,
  ],
})
export default class TeamModule {}
