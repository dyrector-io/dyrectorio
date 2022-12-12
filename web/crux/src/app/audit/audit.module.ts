import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import TeamRepository from '../team/team.repository'
import AuditController from './audit.controller'
import AuditMapper from './audit.mapper'
import AuditService from './audit.service'

@Module({
  imports: [],
  exports: [AuditService],
  controllers: [AuditController],
  providers: [AuditService, AuditMapper, PrismaService, InterceptorGrpcHelperProvider, TeamRepository, KratosService],
})
export default class AuditModule {}
