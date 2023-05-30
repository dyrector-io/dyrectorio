import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import DeployHttpController from './deploy.http.controller'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'
import ProjectMapper from '../project/project.mapper'
import VersionMapper from '../version/version.mapper'
import AuditMapper from '../audit/audit.mapper'
import NodeMapper from '../node/node.mapper'
import AuditLoggerModule from '../audit.logger/audit.logger.module'

@Module({
  imports: [AgentModule, ImageModule, EditorModule, ContainerModule, AuditLoggerModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployHttpController],
  providers: [
    PrismaService,
    DeployService,
    DeployMapper,
    TeamRepository,
    KratosService,
    DeployWebSocketGateway,
    VersionMapper,
    ProjectMapper,
    AuditMapper,
    NodeMapper,
  ],
})
export default class DeployModule {}
