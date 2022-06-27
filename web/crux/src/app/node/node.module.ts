import { Module } from '@nestjs/common'
import { PrismaService } from 'src/config/prisma.service'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { AgentModule } from '../agent/agent.module'
import { TeamModule } from '../team/team.module'
import { TeamRepository } from '../team/team.repository'
import { NodeController } from './node.controller'
import { NodeMapper } from './node.mapper'
import { NodeService } from './node.service'

@Module({
  imports: [AgentModule, TeamModule],
  exports: [],
  controllers: [NodeController],
  providers: [PrismaService, NodeService, NodeMapper, InterceptorGrpcHelperProvider, TeamRepository],
})
export class NodeModule {}
