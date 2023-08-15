import { Agent } from 'src/domain/agent'
import { generateAgentToken } from 'src/domain/agent-token'
import { CruxNotFoundException } from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class AgentConnectionInstallStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    this.throwIfTokenIsInvalid(node, token, 'install')
    this.throwIfConnected(node.id)

    const installer = this.service.getInstallerByNodeId(node.id)
    if (!installer) {
      throw new CruxNotFoundException({
        message: 'Installer not found.',
        property: 'installer',
      })
    }

    const connToken = generateAgentToken(node.id, 'connection')
    const signedConnToken = this.jwtService.sign(connToken)

    const eventChannel = await this.service.getNodeEventsByTeam(node.teamId)

    // update token to the new connection token
    await this.prisma.nodeToken.update({
      where: {
        nodeId: node.id,
      },
      data: {
        nonce: connToken.nonce,
      },
    })

    connection.replaceToken(signedConnToken, connToken)
    const agent = installer.complete({
      connection,
      eventChannel,
      info,
    })

    return agent
  }
}
