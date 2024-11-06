import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CruxJwtModuleImports } from 'src/config/jwt.config'
import EncryptionService from 'src/services/encryption.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import AuditMapper from '../audit/audit.mapper'
import ConfigBundleModule from '../config.bundle/config.bundle.module'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import NodeMapper from '../node/node.mapper'
import ProjectMapper from '../project/project.mapper'
import RegistryModule from '../registry/registry.module'
import TeamRepository from '../team/team.repository'
import VersionMapper from '../version/version.mapper'
import DeployDomainEventListener from './deploy.domain-event.listener'
import DeployHttpController from './deploy.http.controller'
import { DeployJwtStrategy } from './deploy.jwt.strategy'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'

@Module({
  imports: [
    forwardRef(() => AgentModule),
    ImageModule,
    EditorModule,
    RegistryModule,
    ContainerModule,
    ConfigModule,
    ConfigBundleModule,
    AuditLoggerModule,
    ...CruxJwtModuleImports,
  ],
  exports: [DeployService, DeployMapper],
  controllers: [DeployHttpController],
  providers: [
    PrismaService,
    DeployService,
    DeployDomainEventListener,
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
