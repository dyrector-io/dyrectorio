import { JwtService } from '@nestjs/jwt'
import { AgentToken } from 'src/domain/agent-token'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentService from './agent.service'
import AgentConnectionInstallStrategy from './connection-strategies/agent.connection.install.strategy'
import AgentConnectionLegacyStrategy from './connection-strategies/agent.connection.legacy.strategy'
import AgentConnectionStrategy from './connection-strategies/agent.connection.strategy'
import AgentConnectionUpdateStrategy from './connection-strategies/agent.connection.update.strategy'

export default class AgentConnectionStrategyProvider {
  constructor(
    private readonly service: AgentService,
    private readonly jwtService: JwtService,
    private readonly defaultStrategy: AgentConnectionStrategy,
    private readonly legacy: AgentConnectionLegacyStrategy,
    private readonly install: AgentConnectionInstallStrategy,
    private readonly update: AgentConnectionUpdateStrategy,
  ) {}

  select(connection: GrpcNodeConnection): AgentConnectionStrategy {
    const token = this.jwtService.decode(connection.jwt) as AgentToken

    if (!token.type) {
      return this.legacy
    }

    if (token.type === 'install') {
      return this.install
    }

    if (token.type === 'connection') {
      const agent = this.service.getById(token.sub)
      if (!agent) {
        return this.defaultStrategy
      }

      return this.update
    }

    throw new CruxUnauthorizedException({
      message: 'Invalid token type.',
      property: 'type',
    })
  }
}
