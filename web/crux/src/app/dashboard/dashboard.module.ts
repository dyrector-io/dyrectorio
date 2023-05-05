import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import AuditModule from 'src/app/audit/audit.module'
import AgentModule from 'src/app/agent/agent.module'
import KratosService from 'src/services/kratos.service'
import DashboardMapper from './dashboard.mapper'
import DashboardService from './dashboard.service'
import TeamRepository from '../team/team.repository'
import DashboardHttpController from './dashboard.http.controller'

@Module({
  imports: [AuditModule, AgentModule],
  exports: [],
  controllers: [DashboardHttpController],
  providers: [DashboardService, DashboardMapper, PrismaService, KratosService, TeamRepository],
})
export default class DashboardModule {}
