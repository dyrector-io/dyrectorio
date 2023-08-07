import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import AuditLoggerInterceptor from './audit.logger.interceptor'
import AuditLoggerService from './audit.logger.service'

@Module({
  imports: [],
  exports: [AuditLoggerService],
  controllers: [],
  providers: [PrismaService, TeamRepository, AuditLoggerService, AuditLoggerInterceptor],
})
export default class AuditLoggerModule {}
