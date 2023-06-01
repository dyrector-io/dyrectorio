import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import { AgentInfo } from 'src/grpc/protobuf/proto/agent'
import { getToken } from '@willsoto/nestjs-prometheus'
import { PRODUCTION } from 'src/shared/const'
import { Subject, firstValueFrom } from 'rxjs'
import { major, minor } from 'semver'
import AgentService from './agent.service'
import ContainerMapper from '../container/container.mapper'
import { NodeConnectionStatus } from '../node/node.dto'
import AuditLoggerService from '../audit.logger/audit.logger.service'

const GrpcNodeConnectionMock = jest.fn().mockImplementation(() => ({
  nodeId: 'agent-id',
  address: 'localhost',
  connectedAt: new Date(),
  jwt: 'node-jwt',
  status: jest.fn().mockReturnValue(new Subject<NodeConnectionStatus>()),
}))

const createAgentEventsMock = jest.fn()

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
              findUniqueOrThrow: jest.fn().mockReturnValue({
                id: 'node-id',
                teamId: 'team-id',
                token: 'node-jwt',
              }),
              update: jest.fn(),
            },
            agentEvents: {
              create: jest.fn(),
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
      agentEvents: {
        create: createAgentEventsMock,
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
    provide: AuditLoggerService,
    useValue: jest.mocked(AuditLoggerService),
  },
  AgentService,
]

describe('AgentService', () => {
  beforeEach(() => {
    createAgentEventsMock.mockReset()
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
        id: 'agent-id',
        version: '1.2.3-githash (1234-5-67)',
        publicKey: 'key',
      }

      const events = await agentService.getNodeEventsByTeam('team-id')
      const eventPromise = firstValueFrom(events)

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      await eventPromise
      expect(agentSub.closed).toBe(false)

      expect(createAgentEventsMock).toHaveBeenCalled()
    })

    it('handleConnect should let an agent connect with and incorrect version and mark it as outdated', async () => {
      const info: AgentInfo = {
        id: 'agent-id',
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

      expect(createAgentEventsMock).toHaveBeenCalled()
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
        id: 'agent-id',
        version: 'dev-n/a',
        publicKey: 'key',
      }

      const events = await agentService.getNodeEventsByTeam('team-id')
      const eventPromise = firstValueFrom(events)

      const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
      const agentSub = agentObs.subscribe(() => {})

      await eventPromise
      expect(agentSub.closed).toEqual(false)

      expect(createAgentEventsMock).toHaveBeenCalled()
    })
  })
})
