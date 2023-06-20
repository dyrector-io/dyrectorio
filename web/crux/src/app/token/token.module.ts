import { Module } from '@nestjs/common'
import { CruxJwtModuleImports } from 'src/config/jwt.config'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import JwtStrategy from './jwt.strategy'
import TokenHttpController from './token.http.controller'
import TokenMapper from './token.mapper'
import TokenService from './token.service'

@Module({
  imports: [TeamModule, AuditLoggerModule, ...CruxJwtModuleImports],
  controllers: [TokenHttpController],
  providers: [TokenService, JwtStrategy, KratosService, PrismaService, TokenMapper, TeamRepository],
  exports: [],
})
export default class TokenModule {}
