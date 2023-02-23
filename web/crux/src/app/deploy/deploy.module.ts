import { Module } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import KratosService from 'src/services/kratos.service'
import ImageModule from '../image/image.module'
import TeamRepository from '../team/team.repository'
import DeployController from './deploy.controller'
import DeployMapper from './deploy.mapper'
import DeployService from './deploy.service'
import DeployHttpController from './deploy.http.controller'
import SharedModule from '../shared/shared.module'
import AgentModule from '../agent/agent.module'
import DeployRepository from './deploy.repository'

@Module({
  imports: [SharedModule, AgentModule, ImageModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployController, DeployHttpController],
  providers: [
    PrismaService,
    DeployService,
    DeployMapper,
    DeployRepository,
    InterceptorGrpcHelperProvider,
    TeamRepository,
    KratosService,
  ],
})
export default class DeployModule {}
