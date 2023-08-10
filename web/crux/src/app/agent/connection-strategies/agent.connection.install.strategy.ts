import { Agent } from 'src/domain/agent'
import { generateAgentToken } from 'src/domain/agent-token'
import { CruxNotFoundException } from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'

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

    // update token to the new connection token
    await this.prisma.nodeToken.update({
      where: {
        nodeId: node.id,
      },
      data: {
        nonce: connToken.nonce,
      }
    })

    const eventChannel = await this.service.getNodeEventsByTeam(node.teamId)
    const agent = installer.complete({
      connection,
      info,
      eventChannel,
    })

    const tag = this.service.getAgentImageTag()
    agent.startUpdate(tag, signedConnToken)

    return agent.
  }
}
