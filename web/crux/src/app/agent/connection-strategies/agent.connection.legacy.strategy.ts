import { Injectable } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { Agent } from 'src/domain/agent'
import { CruxConflictException } from 'src/exception/crux-exception'
import { AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentConnectionStrategy from './agent.connection.strategy'

@Injectable()
export default class AgentConnectionLegacyStrategy extends AgentConnectionStrategy {
  override async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    const connectedAgent = this.service.getById(node.id)

    if (node.token?.nonce === AgentConnectionLegacyStrategy.LEGACY_NONCE) {
      if (this.service.agentVersionSupported(info.version)) {
        // incoming updated agent with legacy token
        const incomingAgent = await this.createAgent({
          connection,
          info,
          node,
          outdated: false,
        })

        if (connectedAgent) {
          if (!connectedAgent.outdated) {
            // duplicated connection
            throw new CruxConflictException({
              message: 'Agent is already connected.',
              property: 'id',
            })
          }

          this.deleteOldAgentContainer(connectedAgent, incomingAgent)
        }
        // generate new token for the now up to date agent
        const replacement = this.service.generateConnectionTokenFor(incomingAgent.id, node.createdBy)
        incomingAgent.replaceToken(replacement)
        return incomingAgent
      }

      this.throwIfConnected(node.id)

      // simple legacy agent
      return await this.createAgent({
        connection,
        info,
        node,
        outdated: true,
      })
    }

    // this legacy token is already replaced or
    // we send a shutdown to the incoming agent
    info.id = AgentConnectionLegacyStrategy.LEGACY_NONCE

    const incomingAgent = await this.createAgent({
      connection,
      info,
      node,
      outdated: true,
    })

    this.deleteOldAgentContainer(incomingAgent, connectedAgent)
    return incomingAgent
  }

  private async deleteOldAgentContainer(oldAgent: Agent, newAgent: Agent): Promise<void> {
    this.logger.verbose('Sending shutdown to the outdated agent.')
    oldAgent.close(CloseReason.SHUTDOWN)

    const containerName = newAgent?.info?.containerName
    if (containerName) {
      // remove the old agent's container

      this.logger.verbose("Removing old agent's container.")
      await firstValueFrom(
        newAgent.deleteContainers({
          container: {
            prefix: '',
            name: `${containerName}-update`,
          },
        }),
      )
    }
  }

  static LEGACY_NONCE = '00000000-0000-0000-0000-000000000000'

  static CONNECTION_STATUS_LISTENER = () => {}
}
