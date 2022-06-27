import { Module } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { AgentModule } from '../agent/agent.module'
import { ImageModule } from '../image/image.module'
import { TeamRepository } from '../team/team.repository'
import { DeployController } from './deploy.controller'
import { DeployMapper } from './deploy.mapper'
import { DeployService } from './deploy.service'

@Module({
  imports: [AgentModule, ImageModule],
  exports: [DeployService, DeployMapper],
  controllers: [DeployController],
  providers: [PrismaService, DeployService, DeployMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export class DeployModule {}
