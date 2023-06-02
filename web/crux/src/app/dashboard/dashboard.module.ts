import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import DashboardHttpController from './dashboard.http.controller'
import DashboardMapper from './dashboard.mapper'
import DashboardService from './dashboard.service'

@Module({
  imports: [],
  exports: [],
  controllers: [DashboardHttpController],
  providers: [DashboardService, DashboardMapper, PrismaService, KratosService, TeamRepository],
})
export default class DashboardModule {}
