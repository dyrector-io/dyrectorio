import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import TeamModule from 'src/app/team/team.module'
import TeamRepository from 'src/app/team/team.repository'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import NotificationHttpController from './notification.http.controller'
import NotificationMapper from './notification.mapper'
import NotificationService from './notification.service'

@Module({
  imports: [HttpModule, TeamModule, AuditLoggerModule],
  exports: [],
  controllers: [NotificationHttpController],
  providers: [PrismaService, NotificationService, NotificationMapper, TeamRepository, KratosService],
})
export default class NotificationModule {}
