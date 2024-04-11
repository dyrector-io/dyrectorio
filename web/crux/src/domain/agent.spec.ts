import { DeploymentStatusEnum } from '@prisma/client'
import { Subject, firstValueFrom, skip } from 'rxjs'
import { NodeConnectionStatus } from 'src/app/node/node.dto'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { CloseReason, ListSecretsRequest } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerCommandRequest,
  ContainerLogMessage,
  ContainerOperation,
  DeleteContainersRequest,
  DeploymentStatus,
  DeploymentStatusMessage,
  Empty,
  ListSecretsResponse,
} from 'src/grpc/protobuf/proto/common'
import { AGENT_DEFAULT_CALLBACK_TIMEOUT } from 'src/shared/const'
import GrpcNodeConnection from 'src/shared/grpc-node-connection'
import { Agent, AgentConnectionMessage } from './agent'
import { generateAgentToken } from './agent-token'
import AgentUpdate from './agent-update'

// Default timeout is 5sec, but agent callbacks also use a 5sec timeout
// so we need to increase the default timeout to test the secret timeout
const CALLBACK_TEST_TIMEOUT = AGENT_DEFAULT_CALLBACK_TIMEOUT * 2

const AGENT_ID = 'agent-id'
const AGENT_ADDRESS = '127.0.0.1:1234'
const AGENT_VERSION = '1.2.3'
const AGENT_PUBLIC_KEY = 'public-key'

const GrpcNodeConnectionMock = jest.fn().mockImplementation(() => ({
  nodeId: AGENT_ID,
  address: AGENT_ADDRESS,
  connectedAt: new Date(),
  status: jest.fn().mockReturnValue(new Subject<NodeConnectionStatus>()),
}))

it('containerPrefixNameOf should return the combined prefix name', () => {
  expect(
    Agent.containerPrefixNameOf({
      prefix: null,
      name: 'name',
    }),
  ).toEqual('name')

  expect(
    Agent.containerPrefixNameOf({
      prefix: 'prefix',
      name: 'name',
    }),
  ).toEqual('prefix-name')
})

describe('agent', () => {
  let agentConnection: GrpcNodeConnection = null
  let agent: Agent = null
  let eventChannel: Subject<AgentConnectionMessage> = null

  beforeEach(() => {
    eventChannel = new Subject<AgentConnectionMessage>()

    agentConnection = new GrpcNodeConnectionMock()

    agent = new Agent({
      connection: agentConnection,
      eventChannel,
      info: {
        id: AGENT_ID,
        version: AGENT_VERSION,
        publicKey: AGENT_PUBLIC_KEY,
      },
      outdated: false,
      callbackTimeout: AGENT_DEFAULT_CALLBACK_TIMEOUT,
    })
  })

  describe('connection status', () => {
    it('onConnected should send connection status', async () => {
      const eventPromise = firstValueFrom(eventChannel)

      agent.onConnected(jest.fn())

      const actual = await eventPromise
      const expected: AgentConnectionMessage = {
        id: AGENT_ID,
        address: AGENT_ADDRESS,
        status: 'connected',
        version: AGENT_VERSION,
        connectedAt: agentConnection.connectedAt,
      }
      expect(actual).toEqual(expected)
    })

    it('onDisconnected should send unreachable status', async () => {
      const eventPromise = firstValueFrom(eventChannel.pipe(skip(1)))

      agent.onConnected(jest.fn())

      agent.onDisconnected()

      const actual = await eventPromise

      const expected: AgentConnectionMessage = {
        id: AGENT_ID,
        address: null,
        status: 'unreachable',
        version: null,
        connectedAt: null,
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('commands', () => {
    it('close should send command to agent', async () => {
      const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

      agent.close(CloseReason.SELF_DESTRUCT)

      const actual = await commandChannel
      expect(actual).toEqual({
        close: {
          reason: CloseReason.SELF_DESTRUCT,
        },
      })
    })

    it('deploy should send command and return inProgress status', () => {
      agent.onConnected(jest.fn())

      const deploymentStartMock = jest.fn()
      const DeploymentMock = jest.fn().mockImplementation(() => ({
        id: 'deployment-id',
        start: deploymentStartMock,
      }))

      const deployment = new DeploymentMock()

      agent.deploy(deployment)

      expect(agent.getDeployment(deployment.id)).toEqual(deployment)
      expect(deploymentStartMock).toHaveBeenCalled()
    })

    it('deployment should report states', async () => {
      agent.onConnected(jest.fn())

      const deploymentEventSubject = new Subject<DeploymentStatusMessage>()

      const deploymentStartMock = jest.fn(() => deploymentEventSubject.asObservable())
      const deploymentGetStatusMock = jest.fn(() => DeploymentStatusEnum.successful)
      const DeploymentStatusMock = jest.fn().mockImplementation(() => ({
        start: deploymentStartMock,
        getStatus: deploymentGetStatusMock,
      }))

      const testStatusMessage = {
        deploymentStatus: DeploymentStatus.IN_PROGRESS,
        log: [],
      }

      const deployment = new DeploymentStatusMock()

      const deploymentEvents = firstValueFrom(agent.deploy(deployment))
      deploymentEventSubject.next(testStatusMessage)

      await expect(deploymentStartMock).toHaveBeenCalled()

      const deploymentEventsActual = await deploymentEvents
      expect(deploymentEventsActual).toEqual(testStatusMessage)

      const finishStatus = agent.onDeploymentFinished(deployment)

      await expect(deploymentGetStatusMock).toHaveBeenCalled()
      await expect(finishStatus).toEqual(DeploymentStatusEnum.successful)
    })

    it('container command should send agent command', async () => {
      const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

      const command: ContainerCommandRequest = {
        container: {
          prefix: 'prefix',
          name: 'name',
        },
        operation: ContainerOperation.START_CONTAINER,
      }

      agent.sendContainerCommand(command)

      const actual = await commandChannel
      expect(actual).toEqual({
        containerCommand: command,
      })
    })

    it(
      'delete container command should send command',
      async () => {
        const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

        const deleteRequest: DeleteContainersRequest = {
          prefix: 'prefix',
        }

        const deleteRes = agent.deleteContainers(deleteRequest)

        const commandChannelActual = await commandChannel
        expect(commandChannelActual).toEqual({
          deleteContainers: deleteRequest,
        })

        agent.onCallback(
          'deleteContainers',
          Agent.containerPrefixNameOf({
            prefix: deleteRequest.prefix,
            name: '',
          }),
          Empty,
        )

        await expect(deleteRes).resolves.toBe(Empty)
      },
      CALLBACK_TEST_TIMEOUT,
    )

    it(
      'delete container command should timeout if it does not have a response',
      async () => {
        const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

        const deleteRequest: DeleteContainersRequest = {
          prefix: 'prefix',
        }

        const deleteRes = agent.deleteContainers(deleteRequest)

        const commandChannelActual = await commandChannel
        expect(commandChannelActual).toEqual({
          deleteContainers: deleteRequest,
        })
        await expect(deleteRes).rejects.toThrow()
      },
      CALLBACK_TEST_TIMEOUT,
    )
  })

  describe('update', () => {
    const NEW_TOKEN = 'new-token'

    const UPDATE_OPTIONS = {
      signedToken: NEW_TOKEN,
      startedAt: new Date(),
      startedBy: 'user-id',
      token: generateAgentToken(AGENT_ID, 'connection'),
    }

    it('should send update command', async () => {
      const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

      await expect(agent.updating).toEqual(false)

      agent.startUpdate('update-tag', UPDATE_OPTIONS)

      await expect(agent.updating).toEqual(true)

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        update: {
          tag: 'update-tag',
          timeoutSeconds: AgentUpdate.TIMEOUT_SECONDS,
          token: NEW_TOKEN,
        },
      })
    })

    it('should throw exception while updating', () => {
      agent.startUpdate('update-tag', UPDATE_OPTIONS)

      expect(() => agent.startUpdate('update-tag', UPDATE_OPTIONS)).toThrow(CruxPreconditionFailedException)
    })

    it('abort update should return agent to connected state', async () => {
      const eventChannelPromise = firstValueFrom(eventChannel.pipe(skip(1)))

      agent.onConnected(jest.fn())

      agent.startUpdate('update-tag', UPDATE_OPTIONS)

      agent.onUpdateAborted('test')

      await expect(agent.updating).toEqual(false)

      const eventChannelActual = await eventChannelPromise
      const expected: AgentConnectionMessage = {
        id: AGENT_ID,
        status: 'connected',
        error: 'test',
      }
      expect(eventChannelActual).toEqual(expected)
    })
  })

  describe('secrets', () => {
    it('getting container secrets should send command to agent and resolve with secrets', async () => {
      const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

      const req: ListSecretsRequest = {
        container: {
          prefix: 'prefix',
          name: 'name',
        },
      }

      const secrets = agent.listSecrets(req)

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        listSecrets: req,
      })

      const message: ListSecretsResponse = {
        prefix: 'prefix',
        name: 'name',
        publicKey: 'key',
        hasKeys: true,
        keys: ['k1', 'k2', 'k3'],
      }

      agent.onCallback('listSecrets', Agent.containerPrefixNameOf(req.container), message)

      const secretsActual = await secrets
      expect(secretsActual).toEqual(message)
    })

    it(
      'getting container secrets should send command to agent and timeout without a response',
      async () => {
        const commandChannel = firstValueFrom(agent.onConnected(jest.fn()))

        const req: ListSecretsRequest = {
          container: {
            prefix: 'prefix',
            name: 'name',
          },
        }

        const secrets = agent.listSecrets(req)

        const commandChannelActual = await commandChannel
        expect(commandChannelActual).toEqual({
          listSecrets: req,
        })

        await expect(secrets).rejects.toThrow()
      },
      CALLBACK_TEST_TIMEOUT,
    )
  })

  it('getting container logs should stream events', async () => {
    const commandChannel = agent.onConnected(jest.fn())
    const streamStartEvent = firstValueFrom(commandChannel)

    const container = {
      prefix: 'prefix',
      name: 'name',
    }

    const tail = 1000
    const logStream = agent.upsertContainerLogStream(container, tail)
    const [messages] = logStream.watch()

    const logEvent = firstValueFrom(messages)

    const streamStartEventActual = await streamStartEvent
    expect(streamStartEventActual).toEqual({
      containerLog: {
        container: {
          prefix: 'prefix',
          name: 'name',
        },
        streaming: true,
        tail,
      },
    })

    const agentInput = new Subject<ContainerLogMessage>()

    const stream = agent.onContainerLogStreamStarted(container)
    expect(stream).toEqual(logStream)

    stream.onAgentStreamStarted(agentInput).subscribe()

    const testLog = {
      log: 'test log',
    }

    agentInput.next(testLog)

    const logEventActual = await logEvent
    expect(logEventActual).toEqual(testLog)

    agentInput.complete()
  })

  it('getting container status should stream events', async () => {
    const commandChannel = agent.onConnected(jest.fn())
    const streamStartEvent = firstValueFrom(commandChannel)

    const PREFIX = 'prefix'

    const logStream = agent.upsertContainerStatusWatcher(PREFIX, false)

    const logEvent = firstValueFrom(logStream.watch().pipe(skip(1)))

    const streamStartActual = await streamStartEvent
    expect(streamStartActual).toEqual({
      containerState: {
        prefix: PREFIX,
        oneShot: false,
      },
    })

    const [stream, completer] = agent.onContainerStateStreamStarted(PREFIX)
    const completerPromise = firstValueFrom(completer)

    expect(stream).toEqual(logStream)

    const testLog = {
      prefix: PREFIX,
      data: [],
    }

    stream.update(testLog)

    const logEventActual = await logEvent
    expect(logEventActual).toEqual(testLog)

    agent.onContainerStatusStreamFinished(PREFIX)

    const completerActual = await completerPromise
    expect(completerActual).toEqual(undefined)
  })
})
