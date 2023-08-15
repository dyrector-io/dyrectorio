import { DeploymentStatusEnum } from '@prisma/client'
import { Agent } from 'src/domain/agent'
import { CruxConflictException } from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { getPackageVersion } from 'src/shared/package'
import AgentConnectionStrategy from './agent.connection.strategy'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class AgentConnectionUpdateStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    this.throwIfTokenIsInvalid(node, token)

    const updatedAgent = this.service.getById(node.id)
    if (updatedAgent && !updatedAgent.updating) {
      throw new CruxConflictException({
        message: 'Agent is not updating.',
        property: 'updating',
      })
    }

    const outdated = !this.service.agentVersionSupported(info.version)
    if (outdated) {
      this.logger.warn(
        `Agent ('${info.id}') connected with unsupported version '${info.version}', package is '${getPackageVersion(
          this.configService,
        )}'`,
      )
    }

    const newAgent = await this.createAgent({
      connection,
      info,
      node,
      outdated,
    })

    // this will disconnect the old agent
    updatedAgent.onUpdateCompleted(connection)

    await this.prisma.deployment.updateMany({
      where: {
        nodeId: node.id,
        status: DeploymentStatusEnum.inProgress,
      },
      data: {
        status: DeploymentStatusEnum.failed,
      },
    })

    return newAgent
  }
}
