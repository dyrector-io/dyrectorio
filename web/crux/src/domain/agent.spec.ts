import { DeploymentStatusEnum } from '@prisma/client'
import { Subject, firstValueFrom, skip } from 'rxjs'
import { CruxPreconditionFailedException } from 'src/exception/crux-exception'
import { CloseReason } from 'src/grpc/protobuf/proto/agent'
import {
  ContainerCommandRequest,
  ContainerOperation,
  DeleteContainersRequest,
  DeploymentStatus,
  DeploymentStatusMessage,
  Empty,
} from 'src/grpc/protobuf/proto/common'
import { DEFAULT_CONTAINER_LOG_TAIL } from 'src/shared/const'
import { Agent, AgentConnectionMessage } from './agent'
import AgentUpdate from './agent-update'

const AGENT_ID = 'agent-id'
const AGENT_ADDRESS = '127.0.0.1:1234'
const AGENT_VERSION = '1.2.3'
const AGENT_PUBLIC_KEY = 'public-key'

const GrpcNodeConnectionMock = jest.fn().mockImplementation(() => ({
  nodeId: AGENT_ID,
  address: AGENT_ADDRESS,
  connectedAt: new Date(),
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
  let agentConnection: any = null
  let agent: Agent = null
  let eventChannel: Subject<AgentConnectionMessage> = null

  beforeEach(() => {
    eventChannel = new Subject<AgentConnectionMessage>()

    agentConnection = new GrpcNodeConnectionMock()

    agent = new Agent(
      agentConnection,
      {
        id: AGENT_ID,
        version: AGENT_VERSION,
        publicKey: AGENT_PUBLIC_KEY,
      },
      eventChannel,
      false,
    )
  })

  describe('connection status', () => {
    it('onConnected should send connection status', async () => {
      const eventPromise = firstValueFrom(eventChannel)

      agent.onConnected()

      const actual = await eventPromise
      expect(actual).toEqual({
        id: AGENT_ID,
        address: AGENT_ADDRESS,
        status: 'connected',
        version: AGENT_VERSION,
        connectedAt: agentConnection.connectedAt,
        updating: false,
      })
    })

    it('onDisconnected should send unreachable status', async () => {
      const eventPromise = firstValueFrom(eventChannel.pipe(skip(1)))

      agent.onConnected()

      agent.onDisconnected()

      const actual = await eventPromise
      expect(actual).toEqual({
        id: AGENT_ID,
        address: null,
        status: 'unreachable',
        version: null,
        connectedAt: null,
      })
    })
  })

  describe('commands', () => {
    it('close should send command to agent', async () => {
      const commandChannel = firstValueFrom(agent.onConnected())

      agent.close(CloseReason.SELF_DESTRUCT)

      const actual = await commandChannel
      expect(actual).toEqual({
        close: {
          reason: CloseReason.SELF_DESTRUCT,
        },
      })
    })

    it('deploy should send command and return inProgress status', () => {
      agent.onConnected()

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
      agent.onConnected()

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
      const commandChannel = firstValueFrom(agent.onConnected())

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

    it('delete container command should send command', async () => {
      const commandChannel = firstValueFrom(agent.onConnected())

      const deleteRequest: DeleteContainersRequest = {
        prefix: 'prefix',
      }

      const deleteSusbcription = agent.deleteContainers(deleteRequest).subscribe(() => {})

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        deleteContainers: deleteRequest,
      })

      agent.onContainerDeleted(deleteRequest)

      await expect(deleteSusbcription.closed).toBe(true)
    })

    it('delete container command should timeout if without response', async () => {
      const commandChannel = firstValueFrom(agent.onConnected())

      const deleteRequest: DeleteContainersRequest = {
        prefix: 'prefix',
      }

      const deleteChannel = firstValueFrom(agent.deleteContainers(deleteRequest))

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        deleteContainers: deleteRequest,
      })

      const deleteChannelActual = await deleteChannel
      expect(deleteChannelActual).toEqual(Empty)
    })
  })

  describe('update', () => {
    it('should send update command', async () => {
      const commandChannel = firstValueFrom(agent.onConnected())

      await expect(agent.updating).toEqual(false)

      agent.startUpdate('update-tag')

      await expect(agent.updating).toEqual(true)

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        update: {
          tag: 'update-tag',
          timeoutSeconds: AgentUpdate.TIMEOUT_SECONDS,
        },
      })
    })

    it('should throw exception while updating', () => {
      agent.startUpdate('update-tag')

      expect(() => agent.startUpdate('update-tag')).toThrow(CruxPreconditionFailedException)
    })

    it('abort update should return agent to connected state', async () => {
      const eventChannelPromise = firstValueFrom(eventChannel.pipe(skip(1)))

      agent.onConnected()

      agent.startUpdate('update-tag')

      agent.onUpdateAborted('test')

      await expect(agent.updating).toEqual(false)

      const eventChannelActual = await eventChannelPromise
      expect(eventChannelActual).toEqual({
        id: AGENT_ID,
        status: 'connected',
        error: 'test',
        updating: false,
      })
    })
  })

  describe('secrets', () => {
    it('getting container secrets should send command to agent and resolve with secrets', async () => {
      const commandChannel = firstValueFrom(agent.onConnected())

      const secrets = firstValueFrom(agent.getContainerSecrets('prefix', 'name'))

      const commandChannelActual = await commandChannel
      expect(commandChannelActual).toEqual({
        listSecrets: {
          prefix: 'prefix',
          name: 'name',
        },
      })

      const message = {
        prefix: 'prefix',
        name: 'name',
        publicKey: 'key',
        hasKeys: true,
        keys: ['k1', 'k2', 'k3'],
      }

      agent.onContainerSecrets(message)

      const secretsActual = await secrets
      expect(secretsActual).toEqual(message)
    })

    it(
      'getting container secrets should send command to agent and timeout without a response',
      async () => {
        const commandChannel = firstValueFrom(agent.onConnected())

        const secrets = firstValueFrom(agent.getContainerSecrets('prefix', 'name'))

        const commandChannelActual = await commandChannel
        expect(commandChannelActual).toEqual({
          listSecrets: {
            prefix: 'prefix',
            name: 'name',
          },
        })

        await expect(secrets).rejects.toThrow()
      },
      Agent.SECRET_TIMEOUT * 2,
    )
    // Default timeout is 5sec, but getContainerSecrets also uses a 5sec timeout
    // so we need to increase the default timeout to test the secret timeout
  })

  it('getting container logs should stream events', async () => {
    const commandChannel = agent.onConnected()
    const streamStartEvent = firstValueFrom(commandChannel)

    const container = {
      prefix: 'prefix',
      name: 'name',
    }

    const logStream = agent.upsertContainerLogStream(container)

    const logEvent = firstValueFrom(logStream.watch().pipe(skip(1)))

    const streamStartEventActual = await streamStartEvent
    expect(streamStartEventActual).toEqual({
      containerLog: {
        container: {
          prefix: 'prefix',
          name: 'name',
        },
        streaming: true,
        tail: DEFAULT_CONTAINER_LOG_TAIL,
      },
    })

    const [stream, completer] = agent.onContainerLogStreamStarted(container)
    const completerPromise = firstValueFrom(completer)

    expect(stream).toEqual(logStream)

    const testLog = {
      log: 'test log',
    }

    stream.update(testLog)

    const logEventActual = await logEvent
    expect(logEventActual).toEqual(testLog)

    agent.onContainerLogStreamFinished(container)

    const completerActual = await completerPromise
    expect(completerActual).toEqual(undefined)
  })

  it('getting container status should stream events', async () => {
    const commandChannel = agent.onConnected()
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
