import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Node } from 'prisma/prisma-client'
import { Agent, AgentOptions } from 'src/domain/agent'
import { AgentToken } from 'src/domain/agent-token'
import { NodeWithToken } from 'src/domain/node'
import { CruxBadRequestException, CruxConflictException, CruxUnauthorizedException } from 'src/exception/crux-exception'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import PrismaService from 'src/services/prisma.service'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { getPackageVersion } from 'src/shared/package'
import AgentService from '../agent.service'

@Injectable()
export default class AgentConnectionStrategy {
  protected readonly logger = new Logger(AgentConnectionStrategy.name)

  constructor(
    @Inject(forwardRef(() => AgentService))
    protected readonly service: AgentService,
    protected readonly prisma: PrismaService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {}

  async execute(connection: GrpcNodeConnection, info: AgentInfo): Promise<Agent> {
    const token = this.parseToken(connection, info)
    const node = await this.findNodeById(token.sub)

    this.throwIfTokenIsInvalid(node, token)
    this.throwIfConnected(node.id)

    const outdated = !this.service.agentVersionSupported(info.version)
    if (outdated) {
      this.logger.warn(
        `Agent ('${info.id}') connected with unsupported version '${info.version}', package is '${getPackageVersion(
          this.configService,
        )}'`,
      )
    }

    return await this.createAgent({
      connection,
      info,
      node,
      outdated,
    })
  }

  protected parseToken(connection: GrpcNodeConnection, request: AgentInfo): AgentToken {
    const token = this.jwtService.decode(connection.jwt) as AgentToken

    const nodeId = token.sub
    if (request.id !== nodeId) {
      throw new CruxBadRequestException({
        message: 'Node id mismatch.',
      })
    }

    return token
  }

  protected async findNodeById(id: string): Promise<NodeWithToken> {
    const node = await this.prisma.node.findUniqueOrThrow({
      include: {
        token: true,
      },
      where: {
        id,
      },
    })

    return node
  }

  protected throwIfConnected(id: string) {
    const connectedAgent = this.service.getById(id)
    if (connectedAgent) {
      throw new CruxConflictException({
        message: 'Agent is already connected.',
        property: 'id',
      })
    }
  }

  protected throwIfTokenIsInvalid(node: NodeWithToken, token: AgentToken) {
    if (!node.token || node.token.nonce !== token.nonce || token.type !== 'connection') {
      throw new CruxUnauthorizedException({
        message: 'Invalid token.',
      })
    }
  }

  protected async createAgent(options: CreateAgentOptions): Promise<Agent> {
    const { connection, node } = options

    const eventChannel = await this.service.getNodeEventsByTeam(node.teamId)
    const agent = new Agent({
      ...options,
      eventChannel,
    })

    await this.prisma.node.update({
      where: { id: node.id },
      data: {
        address: connection.address,
        connectedAt: connection.connectedAt,
      },
    })

    return agent
  }
}

type CreateAgentOptions = Omit<AgentOptions, 'eventChannel'> & {
  node: Node
}
