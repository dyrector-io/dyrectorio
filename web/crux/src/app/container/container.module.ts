import { forwardRef, Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import ConfigBundleModule from '../config.bundle/config.bundle.module'
import DeployModule from '../deploy/deploy.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import ProjectModule from '../project/project.module'
import VersionModule from '../version/version.module'
import ContainerConfigDomainEventListener from './container-config.domain-event.listener'
import ContainerConfigHttpController from './container-config.http.service'
import ContainerConfigService from './container-config.service'
import ContainerConfigWebSocketGateway from './container-config.ws.gateway'
import ContainerMapper from './container.mapper'

@Module({
  imports: [
    AuditLoggerModule,
    EditorModule,
    forwardRef(() => AgentModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => VersionModule),
    forwardRef(() => ImageModule),
    forwardRef(() => DeployModule),
    forwardRef(() => ConfigBundleModule),
  ],
  exports: [ContainerMapper, ContainerConfigService],
  controllers: [ContainerConfigHttpController],
  providers: [
    PrismaService,
    ContainerMapper,
    ContainerConfigService,
    ContainerConfigDomainEventListener,
    ContainerConfigWebSocketGateway,
  ],
})
export default class ContainerModule {}
