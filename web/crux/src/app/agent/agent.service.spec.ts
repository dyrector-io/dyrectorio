import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getToken } from '@willsoto/nestjs-prometheus'
import { Subject, firstValueFrom } from 'rxjs'
import { major, minor } from 'semver'
import { AgentToken } from 'src/domain/agent-token'
import { NodeWithToken } from 'src/domain/node'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import { PRODUCTION } from 'src/shared/const'
import ContainerMapper from '../container/container.mapper'
import DeployService from '../deploy/deploy.service'
import { NodeConnectionStatus } from '../node/node.dto'
import { AGENT_STRATEGY_TYPES } from './agent.connection-strategy.provider'
import AgentService from './agent.service'

const GrpcNodeConnectionMock = jest.fn().mockImplementation(() => ({
  nodeId: 'agent-id',
  address: 'localhost',
  connectedAt: new Date(),
  jwt: 'connection-token',
  status: jest.fn().mockReturnValue(new Subject<NodeConnectionStatus>()),
}))

const CONNECTION_TOKEN: AgentToken = {
  iat: 0,
  iss: 'localhost:8000',
  nonce: 'connection-token-nonce',
  sub: 'node-id',
  type: 'connection',
  version: '0.1.0',
}

const JwtServiceMock = jest.fn().mockImplementation(() => ({
  decode: jest.fn((signedToken: string): AgentToken => {
    switch (signedToken) {
      default:
        return CONNECTION_TOKEN
    }
  }),
}))

const createNodeEventMock = jest.fn()

const nodeWithTokenMock: Pick<NodeWithToken, 'id' | 'teamId' | 'token'> = {
  id: 'node-id',
  teamId: 'team-id',
  token: {
    nodeId: 'node-id',
    nonce: 'connection-token-nonce',
    createdBy: 'user-id',
  },
}

const mockModules = (env: string, packageVersion: string) => [
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
              findUniqueOrThrow: jest.fn().mockReturnValue(nodeWithTokenMock),
              update: jest.fn(),
            },
          }).then(() => {
            resolve(null)
          })
        }),
      node: {
        findUniqueOrThrow: jest.fn().mockReturnValue(nodeWithTokenMock),
        update: jest.fn(),
      },
      nodeEvent: {
        create: createNodeEventMock,
      },
      team: {
        findUniqueOrThrow: jest.fn().mockReturnValue({
          id: 'team-id',
        }),
      },
    },
  },
  {
    provide: JwtService,
    useValue: new JwtServiceMock(),
  },
  {
    provide: ConfigService,
    useValue: {
      get: jest.fn().mockImplementation(key => {
        if (key === 'NODE_ENV') {
          return env
        }
        if (key === 'npm_package_version') {
          return packageVersion
        }
        if (key === 'CRUX_AGENT_IMAGE') {
          return `${major(packageVersion)}.${minor(packageVersion)}`
        }
        throw new Error(`Unexpected ConfigService key '${key}'`)
      }),
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
  {
    provide: DeployService,
    useValue: jest.mocked(DeployService),
  },
  ...AGENT_STRATEGY_TYPES,
  AgentService,
]

describe('AgentService', () => {
  beforeEach(() => {
    createNodeEventMock.mockReset()
  })

  describe('production environment', () => {
    let agentService: AgentService = null

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        controllers: [],
        providers: mockModules(PRODUCTION, '1.2.3'),
      }).compile()

      agentService = module.get<AgentService>(AgentService)
    })

    it('handleConnect should let an agent connect with the correct version', async () => {
      const info: AgentInfo = {
        id: 'node-id',
        version: '1.2.3-githash (1234-5-67)',
        publicKey: 'key',
      }

      const events = await agentService.getNodeEventsByTeam('team-id')
      const eventPromise = firstValueFrom(events)

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      await eventPromise
      expect(agentSub.closed).toBe(false)

      expect(createNodeEventMock).toHaveBeenCalled()
    })

    it('handleConnect should let an agent connect with and incorrect version and mark it as outdated', async () => {
      const info: AgentInfo = {
        id: 'node-id',
        version: '2.3.4-githash (1234-5-67)',
        publicKey: 'key',
      }

      const events = await agentService.getNodeEventsByTeam('team-id')
      const eventPromise = firstValueFrom(events)

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      expect(agentSub.closed).toBe(false)

      const eventActual = await eventPromise
      expect(eventActual).toMatchObject({
        status: 'outdated',
      })

      expect(createNodeEventMock).toHaveBeenCalled()
    })
  })

  describe('development environment', () => {
    let agentService: AgentService = null

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        controllers: [],
        providers: mockModules('development', '1.2.3'),
      }).compile()

      agentService = module.get<AgentService>(AgentService)
    })

    it('handleConnect should let an agent connect with an invalid version', async () => {
      const info: AgentInfo = {
        id: 'node-id',
        version: 'dev-n/a',
        publicKey: 'key',
      }

      const events = await agentService.getNodeEventsByTeam('team-id')
      const eventPromise = firstValueFrom(events)

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      await eventPromise
      expect(agentSub.closed).toEqual(false)

      expect(createNodeEventMock).toHaveBeenCalled()
    })
  })
})
