import { Test, TestingModule } from '@nestjs/testing'
import NodeService from './node.service'
import TeamRepository from '../team/team.repository'
import AgentService from '../agent/agent.service'
import NodeMapper from './node.mapper'
import DomainNotificationService from 'src/services/domain.notification.service'
import PrismaService from 'src/services/prisma.service'
import { of } from 'rxjs'

describe('NodeService', () => {
  describe('Container audit log', () => {
    let createAgentEventMock = jest.fn()
    let nodeService: NodeService = null

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        controllers: [],
        providers: [
          {
            provide: TeamRepository,
            useValue: jest.mocked(TeamRepository),
          },
          {
            provide: AgentService,
            useValue: {
              ...jest.mocked(AgentService),
              createAgentAudit: createAgentEventMock,
              getByIdOrThrow: () => ({
                sendContainerCommand: jest.fn(),
                deleteContainers: jest.fn(() => of(null)),
              }),
            },
          },
          {
            provide: NodeMapper,
            useValue: jest.mocked(NodeMapper),
          },
          {
            provide: DomainNotificationService,
            useValue: jest.mocked(DomainNotificationService),
          },
          {
            provide: PrismaService,
            useValue: jest.mocked(PrismaService),
          },
          NodeService,
        ],
      }).compile()

      createAgentEventMock.mockReset()
      nodeService = module.get<NodeService>(NodeService)
    })

    it('startContainer should create an audit event', () => {
      nodeService.startContainer('test-node-id', 'test-prefix', 'test-name')

      expect(createAgentEventMock).toHaveBeenCalledWith('test-node-id', 'containerCommand', {
        container: {
          prefix: 'test-prefix',
          name: 'test-name',
        },
        operation: 'startContainer',
      })
    })

    it('stopContainer should create an audit event', () => {
      nodeService.stopContainer('test-node-id', 'test-prefix', 'test-name')

      expect(createAgentEventMock).toHaveBeenCalledWith('test-node-id', 'containerCommand', {
        container: {
          prefix: 'test-prefix',
          name: 'test-name',
        },
        operation: 'stopContainer',
      })
    })

    it('restartContainer should create an audit event', () => {
      nodeService.restartContainer('test-node-id', 'test-prefix', 'test-name')

      expect(createAgentEventMock).toHaveBeenCalledWith('test-node-id', 'containerCommand', {
        container: {
          prefix: 'test-prefix',
          name: 'test-name',
        },
        operation: 'restartContainer',
      })
    })

    it('deleteContainer should create an audit event', () => {
      nodeService.deleteContainer('test-node-id', 'test-prefix', 'test-name')

      expect(createAgentEventMock).toHaveBeenCalledWith('test-node-id', 'containerCommand', {
        container: {
          prefix: 'test-prefix',
          name: 'test-name',
        },
        operation: 'deleteContainer',
      })
    })

    it('deleteAllContainers should create an audit event', () => {
      nodeService.deleteAllContainers('test-node-id', 'test-prefix')

      expect(createAgentEventMock).toHaveBeenCalledWith('test-node-id', 'containerCommand', {
        prefix: 'test-prefix',
        operation: 'deleteContainers',
      })
    })
  })
})
