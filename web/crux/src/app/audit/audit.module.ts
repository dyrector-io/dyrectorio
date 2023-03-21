import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamRepository from '../team/team.repository'
import AuditService from './audit.service'
import AuditController from './audit.http.controller'

@Module({
  imports: [],
  exports: [AuditService],
  controllers: [AuditController],
  providers: [AuditService, PrismaService, InterceptorGrpcHelperProvider, TeamRepository, KratosService],
})
export default class AuditModule {}
