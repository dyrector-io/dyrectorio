import { forwardRef, Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditMapper from '../audit/audit.mapper'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import TokenModule from '../token/token.module'
import VersionModule from '../version/version.module'
import ProjectHttpController from './project.http.controller'
import ProjectMapper from './project.mapper'
import ProjectService from './project.service'

@Module({
  imports: [forwardRef(() => VersionModule), TeamModule, TokenModule, AuditLoggerModule],
  exports: [ProjectMapper, ProjectService],
  controllers: [ProjectHttpController],
  providers: [PrismaService, ProjectService, ProjectMapper, TeamRepository, KratosService, AuditMapper],
})
export default class ProjectModule {}
