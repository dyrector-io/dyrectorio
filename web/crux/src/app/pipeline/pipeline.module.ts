import { Module } from '@nestjs/common'
import { CruxJwtModuleImports } from 'src/config/jwt.config'
import AzureDevOpsService from 'src/services/azure-devops.service'
import EncryptionService from 'src/services/encryption.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditModule from '../audit/audit.module'
import TeamModule from '../team/team.module'
import TeamRepository from '../team/team.repository'
import PipelineHttpController from './pipeline.http.controller'
import { PipelineJwtStrategy } from './pipeline.jwt.strategy'
import PipelineMapper from './pipeline.mapper'
import PipelineRunStateService from './pipeline.run-state.service'
import PipelineService from './pipeline.service'
import PipelineWebSocketGateway from './pipeline.ws.gateway'
import EncryptionService from 'src/services/encryption.service'

@Module({
  imports: [AuditModule, TeamModule, AuditLoggerModule, ...CruxJwtModuleImports],
  exports: [PipelineMapper, PipelineService],
  controllers: [PipelineHttpController],
  providers: [
    PipelineService,
    PipelineRunStateService,
    PipelineWebSocketGateway,
    PrismaService,
    PipelineMapper,
    TeamRepository,
    AzureDevOpsService,
    PipelineJwtStrategy,
    EncryptionService,
  ],
})
export default class PipelineModule {}
