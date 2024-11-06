import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerModule from '../audit.logger/audit.logger.module'
import EditorModule from '../editor/editor.module'
import ContainerConfigDomainEventListener from './container-config.domain-event.listener'
import ContainerConfigService from './container-config.service'
import ContainerConfigWebSocketGateway from './container-config.ws.gateway'
import ContainerMapper from './container.mapper'

@Module({
  imports: [AuditLoggerModule, EditorModule],
  exports: [ContainerMapper, ContainerConfigService],
  controllers: [],
  providers: [
    PrismaService,
    ContainerMapper,
    ContainerConfigService,
    ContainerConfigDomainEventListener,
    ContainerConfigWebSocketGateway,
  ],
})
export default class ContainerModule {}
