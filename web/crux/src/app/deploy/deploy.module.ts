import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AuditLoggerService from 'src/shared/audit.logger.service'
import AuditLoggerInterceptor from 'src/interceptors/audit-logger.interceptor'
import AgentModule from '../agent/agent.module'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import DeployHttpController from './deploy.http.controller'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'

@Module({
  imports: [AgentModule, ImageModule, EditorModule, ContainerModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployHttpController],
  providers: [
    PrismaService,
    DeployService,
    DeployMapper,
    TeamRepository,
    KratosService,
    DeployWebSocketGateway,
    AuditLoggerInterceptor,
    AuditLoggerService,
  ],
})
export default class DeployModule {}
