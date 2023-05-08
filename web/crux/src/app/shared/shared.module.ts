import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import RecaptchaService from './recaptcha.service'
import SharedMapper from './shared.mapper'
import AuditLoggerService from './audit.logger.service'

@Module({
  imports: [],
  exports: [SharedMapper, RecaptchaService, TeamRepository, AuditLoggerService],
  controllers: [],
  providers: [SharedMapper, RecaptchaService, PrismaService, TeamRepository, AuditLoggerService],
})
export default class SharedModule {}
