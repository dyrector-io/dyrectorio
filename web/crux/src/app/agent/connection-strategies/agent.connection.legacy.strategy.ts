import { Agent } from 'src/domain/agent'
import { AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'

export default class AgentConnectionLegacyStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    this.throwIfConnected(node.id)

    const agent = await this.createAgent({
      connection,
      info,
      node,
      outdated: true,
    })

    if (node.token) {
      // already has a new token

      agent.close(CloseReason.SHUTDOWN)
      agent.onDisconnected()
      return null
    }

    return agent
  }
}
