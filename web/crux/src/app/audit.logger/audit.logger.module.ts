import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerService from './audit.logger.service'
import AuditLoggerInterceptor from './audit.logger.interceptor'
import TeamRepository from '../team/team.repository'

@Module({
  imports: [],
  exports: [AuditLoggerService],
  controllers: [],
  providers: [PrismaService, TeamRepository, AuditLoggerService, AuditLoggerInterceptor],
})
export default class AuditLoggerModule {}
