import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import StorageHttpController from './storage.http.controller'
import StorageMapper from './storage.mapper'
import StorageService from './storage.service'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule],
  exports: [StorageMapper, StorageService],
  controllers: [StorageHttpController],
  providers: [StorageService, PrismaService, StorageMapper, TeamRepository, KratosService],
})
export default class StorageModule {}
