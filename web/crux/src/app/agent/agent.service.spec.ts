import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import { AgentInfo, CloseReason } from 'src/grpc/protobuf/proto/agent'
import { getToken } from '@willsoto/nestjs-prometheus'
import { PRODUCTION } from 'src/shared/const'
import { Subject, toArray, firstValueFrom } from 'rxjs'
import AgentService from './agent.service'
import ContainerMapper from '../container/container.mapper'
import { NodeConnectionStatus } from '../node/node.dto'

jest.mock('../../../package.json', () => ({
  version: '1.2.3',
}))

const GrpcNodeConnectionMock = jest.fn().mockImplementation(() => ({
  nodeId: 'agent-id',
  address: 'localhost',
  connectedAt: new Date(),
  jwt: 'node-jwt',
  status: jest.fn().mockReturnValue(new Subject<NodeConnectionStatus>()),
}))

const mockModules = (env: string) => [
  {
    provide: getToken('agent_online_count'),
    useValue: {
      inc: jest.fn(),
    },
  },
  {
    provide: PrismaService,
    useValue: {
      $transaction: (fn: (prisma: any) => Promise<void>) =>
        new Promise(resolve => {
          fn({
            node: {
              findUniqueOrThrow: jest.fn().mockReturnValue({
                id: 'node-id',
                teamId: 'team-id',
                token: 'node-jwt',
              }),
              update: jest.fn(),
            },
          }).then(() => {
            resolve(null)
          })
        }),
      team: {
        findUniqueOrThrow: jest.fn().mockReturnValue({
          id: 'team-id',
        }),
      },
    },
  },
  {
    provide: JwtService,
    useValue: jest.mocked(JwtService),
  },
  {
    provide: ConfigService,
    useValue: {
      get: jest.fn().mockReturnValue(env),
    },
  },
  {
    provide: DomainNotificationService,
    useValue: jest.mocked(DomainNotificationService),
  },
  {
    provide: ContainerMapper,
    useValue: jest.mocked(ContainerMapper),
  },
  AgentService,
]

describe('AgentService', () => {
  describe('production environment', () => {
    let agentService: AgentService = null

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        controllers: [],
        providers: mockModules(PRODUCTION),
      }).compile()

      agentService = module.get<AgentService>(AgentService)
    })

    it('handleConnect should let an agent connect with the correct version', () => {
      const info: AgentInfo = {
        id: 'agent-id',
        version: '1.2.3-githash (1234-5-67)',
        publicKey: 'key',
      }

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      expect(agentSub.closed).toBe(false)
    })

    it('handleConnect should close connection if an agent has a non supported version', async () => {
      const info: AgentInfo = {
        id: 'agent-id',
        version: '1.3.4-githash (1234-5-67)',
        publicKey: 'key',
      }

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const commands = await firstValueFrom(agentObs.pipe(toArray()))

      expect(commands).toEqual([
        {
          close: {
            reason: CloseReason.SHUTDOWN,
          },
        },
      ])
    })

    it('handleConnect should close connection if an agent has an invalid version format', async () => {
      const info: AgentInfo = {
        id: 'agent-id',
        version: 'dev-n/a',
        publicKey: 'key',
      }

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const commands = await firstValueFrom(agentObs.pipe(toArray()))

      expect(commands).toEqual([
        {
          close: {
            reason: CloseReason.SHUTDOWN,
          },
        },
      ])
    })
  })

  describe('development environment', () => {
    let agentService: AgentService = null

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        controllers: [],
        providers: mockModules('development'),
      }).compile()

      agentService = module.get<AgentService>(AgentService)
    })

    it('handleConnect should let an agent connect with an invalid version', async () => {
      const info: AgentInfo = {
        id: 'agent-id',
        version: 'dev-n/a',
        publicKey: 'key',
      }

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      expect(agentSub.closed).toEqual(false)
    })
  })
})
