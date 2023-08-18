import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import TeamRepository from '../team/team.repository'
import AuditController from './audit.http.controller'
import AuditMapper from './audit.mapper'
import AuditService from './audit.service'

@Module({
  imports: [],
  exports: [AuditService, AuditMapper],
  controllers: [AuditController],
  providers: [AuditService, PrismaService, TeamRepository, KratosService, AuditMapper],
})
export default class AuditModule {}
