import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import AuditLoggerService from 'src/shared/audit.logger.service'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import StorageService from './storage.service'
import StorageMapper from './storage.mapper'
import StorageHttpController from './storage.http.controller'

@Module({
  imports: [HttpModule, TeamModule],
  exports: [StorageMapper, StorageService],
  controllers: [StorageHttpController],
  providers: [
    StorageService,
    PrismaService,
    StorageMapper,
    TeamRepository,
    KratosService,
    AuditLoggerService,
    AuditLoggerInterceptor,
  ],
})
export default class StorageModule {}
