import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import AuditModule from 'src/app/audit/audit.module'
import AgentModule from 'src/app/agent/agent.module'
import KratosService from 'src/services/kratos.service'
import DashboardMapper from './dashboard.mapper'
import DashboardService from './dashboard.service'
import DashboardController from './dashboard.controller'

@Module({
  imports: [AuditModule, AgentModule],
  exports: [],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardMapper, PrismaService, InterceptorGrpcHelperProvider, KratosService],
})
export default class DashboardModule {}
