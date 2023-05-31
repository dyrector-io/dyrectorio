import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import KratosService from 'src/services/kratos.service'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import VersionModule from '../version/version.module'
import ProjectMapper from './project.mapper'
import ProjectService from './project.service'
import ProjectHttpController from './project.http.controller'
import TokenModule from '../token/token.module'
import AuditMapper from '../audit/audit.mapper'
import AuditLoggerModule from '../audit.logger/audit.logger.module'

@Module({
  imports: [VersionModule, TeamModule, TokenModule, AuditLoggerModule],
  exports: [ProjectMapper, ProjectService],
  controllers: [ProjectHttpController],
  providers: [PrismaService, ProjectService, ProjectMapper, TeamRepository, KratosService, AuditMapper],
})
export default class ProjectModule {}
