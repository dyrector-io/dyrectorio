import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Agent } from 'src/domain/agent'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'

@Injectable()
export default class AgentConnectionLegacyStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    if (node.token?.nonce !== AgentConnectionLegacyStrategy.LEGACY_NONCE) {
      throw new UnauthorizedException('Invalid token.')
    }

    this.throwIfConnected(node.id)

    const agent = await this.createAgent({
      connection,
      info,
      node,
      outdated: true,
    })

    return agent
  }

  private static LEGACY_NONCE = '00000000-0000-0000-0000-000000000000'
}
