import KratosService from 'src/services/kratos.service'
import TeamRepository from 'src/app/team/team.repository'
import TeamModule from 'src/app/team/team.module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import NotificationController from './notification.controller'
import NotificationService from './notification.service'
import NotificationMapper from './notification.mapper'

@Module({
  imports: [HttpModule, TeamModule],
  exports: [],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationMapper, PrismaService, TeamRepository, KratosService],
})
export default class NotificationModule {}
