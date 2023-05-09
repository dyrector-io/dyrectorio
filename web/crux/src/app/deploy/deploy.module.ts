import { Module } from '@nestjs/common'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import ContainerModule from '../container/container.module'
import EditorModule from '../editor/editor.module'
import ImageModule from '../image/image.module'
import SharedModule from '../shared/shared.module'
import TeamRepository from '../team/team.repository'
import DeployHttpController from './deploy.http.controller'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'

@Module({
  imports: [AgentModule, ImageModule, SharedModule, EditorModule, ContainerModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployHttpController],
  providers: [PrismaService, DeployService, DeployMapper, TeamRepository, KratosService, DeployWebSocketGateway],
})
export default class DeployModule {}
