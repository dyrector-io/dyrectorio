import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AgentToken } from 'src/domain/agent-token'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import AgentService from './agent.service'
import AgentConnectionInstallStrategy from './connection-strategies/agent.connection.install.strategy'
import AgentConnectionLegacyStrategy from './connection-strategies/agent.connection.legacy.strategy'
import AgentConnectionStrategy from './connection-strategies/agent.connection.strategy'
import AgentConnectionUpdateStrategy from './connection-strategies/agent.connection.update.strategy'

@Injectable()
export default class AgentConnectionStrategyProvider {
  private readonly logger = new Logger(AgentConnectionStrategyProvider.name)

  constructor(
    @Inject(forwardRef(() => AgentService))
    private readonly service: AgentService,
    private readonly jwtService: JwtService,
    private readonly defaultStrategy: AgentConnectionStrategy,
    private readonly legacy: AgentConnectionLegacyStrategy,
    private readonly install: AgentConnectionInstallStrategy,
    private readonly update: AgentConnectionUpdateStrategy,
  ) {}

  select(connection: GrpcNodeConnection): AgentConnectionStrategy {
    const token = this.jwtService.decode(connection.jwt) as AgentToken

    if (!token.version) {
      this.logger.verbose('No version found in the token. Using legacy strategy.')
      return this.legacy
    }

    if (token.type === 'install') {
      this.logger.verbose('Install token detected. Using install strategy.')
      return this.install
    }

    if (token.type === 'connection') {
      const agent = this.service.getById(token.sub)
      if (!agent) {
        this.logger.verbose('Connection token detected. No connected agent found. Using default strategy.')
        return this.defaultStrategy
      }

      this.logger.verbose('Connection token detected. Connected agent found. Using update strategy.')
      return this.update
    }

    throw new CruxUnauthorizedException({
      message: 'Invalid token type.',
      property: 'type',
    })
  }
}

export const AGENT_STRATEGY_TYPES = [
  AgentConnectionStrategy,
  AgentConnectionLegacyStrategy,
  AgentConnectionInstallStrategy,
  AgentConnectionUpdateStrategy,
  AgentConnectionStrategyProvider,
]
