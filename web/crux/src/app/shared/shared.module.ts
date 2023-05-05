import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import ContainerMapper from './container.mapper'
import SharedMapper from './shared.mapper'
import RecaptchaService from './recaptcha.service'
import TeamRepository from '../team/team.repository'
import AuditLoggerService from './audit.logger.service'

@Module({
  imports: [],
  exports: [ContainerMapper, SharedMapper, RecaptchaService, AuditLoggerService],
  controllers: [],
  providers: [ContainerMapper, SharedMapper, RecaptchaService, PrismaService, TeamRepository, AuditLoggerService],
})
export default class SharedModule {}
