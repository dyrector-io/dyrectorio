import { Module } from '@nestjs/common'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import AgentModule from '../agent/agent.module'
import ImageModule from '../image/image.module'
import SharedModule from '../shared/shared.module'
import TeamRepository from '../team/team.repository'
import DeployController from './deploy.controller'
import DeployHttpController from './deploy.http.controller'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployWebSocketGateway from './deploy.ws.gateway'

@Module({
  imports: [AgentModule, ImageModule, SharedModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployController, DeployHttpController],
  providers: [PrismaService, DeployService, DeployMapper, InterceptorGrpcHelperProvider, TeamRepository, KratosService, DeployWebSocketGateway],
})
export default class DeployModule {}
