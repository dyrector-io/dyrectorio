import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CruxJwtModuleImports } from 'src/config/jwt.config'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditMapper from '../audit/audit.mapper'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import NodeMapper from '../node/node.mapper'
import ProjectMapper from '../project/project.mapper'
import TeamRepository from '../team/team.repository'
import VersionMapper from '../version/version.mapper'
import DeployHttpController from './deploy.http.controller'
import { DeployJwtStrategy } from './deploy.jwt.strategy'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'
import EncryptionService from 'src/services/encryption.service'

@Module({
  imports: [
    forwardRef(() => AgentModule),
    ImageModule,
    EditorModule,
    ContainerModule,
    ConfigModule,
    AuditLoggerModule,
    ...CruxJwtModuleImports,
  ],
  exports: [DeployService, DeployMapper],
  controllers: [DeployHttpController],
  providers: [
    PrismaService,
    DeployService,
    DeployMapper,
    TeamRepository,
    KratosService,
    EncryptionService,
    DeployWebSocketGateway,
    VersionMapper,
    ProjectMapper,
    AuditMapper,
    NodeMapper,
    DeployJwtStrategy,
  ],
})
export default class DeployModule {}
