import { Injectable } from '@nestjs/common'
import { Agent } from 'src/domain/agent'
import { AgentToken } from 'src/domain/agent-token'
import { NodeWithToken } from 'src/domain/node'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'

@Injectable()
export default class AgentConnectionInstallStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    this.throwIfTokenIsInvalid(node, token)
    this.throwIfConnected(node.id)

    const installer = this.service.getInstallerByNodeId(node.id)
    if (!installer) {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }

    const replacement = this.service.generateConnectionTokenFor(node.id, node.createdBy)

    const eventChannel = await this.service.getNodeEventsByTeam(node.teamId)

    const agent = installer.complete({
      connection,
      eventChannel,
      info,
      callbackTimeout: this.callbackTimeout,
    })

    await this.service.completeInstaller(installer)

    this.logger.verbose('Installer completed, replacing the install token.')
    agent.replaceToken(replacement)

    return agent
  }

  override throwIfTokenIsInvalid(node: NodeWithToken, token: AgentToken) {
    if (node.token || token.type !== 'install') {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }
  }
}
