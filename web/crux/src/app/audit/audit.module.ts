import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import TeamRepository from '../team/team.repository'
import AuditService from './audit.service'
import AuditController from './audit.http.controller'
import AuditMapper from './audit.mapper'

@Module({
  imports: [],
  exports: [AuditService, AuditMapper],
  controllers: [AuditController],
  providers: [AuditService, PrismaService, TeamRepository, KratosService, AuditMapper],
})
export default class AuditModule {}
