import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamRepository from '../team/team.repository'
import AuditMapper from './audit.mapper'
import AuditService from './audit.service'
import AuditController from './audit.http.controller'
import AuditGrpcController from './audit.controller'

@Module({
  imports: [],
  exports: [AuditService, AuditGrpcController],
  controllers: [AuditController],
  providers: [AuditService, AuditMapper, PrismaService, InterceptorGrpcHelperProvider, TeamRepository, KratosService],
})
export default class AuditModule {}
