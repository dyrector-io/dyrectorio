import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import useNodeState from '@app/components/nodes/use-node-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { DEPLOYMENT_EDIT_WS_REQUEST_DELAY } from '@app/const'
import { useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentDetails,
  DeploymentEnvUpdatedMessage,
  DeploymentInvalidatedSecrets,
  deploymentIsCopiable,
  deploymentIsDeletable,
  deploymentIsDeployable,
  deploymentIsMutable,
  deploymentLogVisible,
  DeploymentRoot,
  DyoNode,
  GetInstanceMessage,
  ImageDeletedMessage,
  Instance,
  InstanceMessage,
  InstancesAddedMessage,
  InstanceUpdatedMessage,
  NodeEventMessage,
  ProjectDetails,
  UniqueKeyValue,
  VersionDetails,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_NODE_EVENT,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
  WS_TYPE_PATCH_RECEIVED,
} from '@app/models'
import { deploymentWsUrl, WS_NODES } from '@app/routes'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useState } from 'react'

export type DeploymentEditState = 'details' | 'edit' | 'copy'

export type DeploymentStateOptions = {
  deployment: DeploymentRoot
  onWsError: (error: Error) => void
}

export type DeploymentState = {
  deployment: DeploymentDetails
  project: ProjectDetails
  node: DyoNode
  version: VersionDetails
  instances: Instance[]
  mutable: boolean
  deployable: boolean
  copiable: boolean
  deletable: boolean
  saving: boolean
  editState: DeploymentEditState
  editor: EditorState
  viewMode: ViewMode
  sock: WebSocketClientEndpoint
  showDeploymentLog: boolean
}

export type DeploymentActions = {
  setEditState: (state: DeploymentEditState) => void
  onDeploymentEdited: (editedDeployment: DeploymentDetails) => void
  onEnvironmentEdited: (environment: UniqueKeyValue[]) => void
  setViewMode: (viewMode: ViewMode) => void
  onInvalidateSecrets: (secrets: DeploymentInvalidatedSecrets[]) => void
}

const mergeInstancePatch = (instance: Instance, message: InstanceUpdatedMessage): Instance => ({
  ...instance,
  config: {
    ...instance.config,
    ...message,
  },
})

const useDeploymentState = (options: DeploymentStateOptions): [DeploymentState, DeploymentActions] => {
  const { deployment: optionDeploy, onWsError } = options
  const { project, version } = optionDeploy

  const envEditThrottle = useThrottling(DEPLOYMENT_EDIT_WS_REQUEST_DELAY)

  const [deployment, setDeployment] = useState<DeploymentDetails>(optionDeploy)
  const [node, setNode] = useNodeState(optionDeploy.node)
  const [saving, setSaving] = useState(false)
  const [editState, setEditState] = useState<DeploymentEditState>('details')
  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const mutable = deploymentIsMutable(deployment.status, version.type)
  const deployable = deploymentIsDeployable(deployment.status, version.type)
  const deletable = deploymentIsDeletable(deployment.status)
  const copiable = deploymentIsCopiable(deployment.status)
  const showDeploymentLog = deploymentLogVisible(deployment.status)

  const nodesSock = useWebSocket(WS_NODES)
  nodesSock.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    if (message.id !== node.id) {
      return
    }

    setNode({
      ...node,
      status: message.status,
      address: message.address,
      updating: message.updating ?? node.updating,
    })
  })

  const sock = useWebSocket(deploymentWsUrl(deployment.id), {
    onSend: message => {
      if ([WS_TYPE_PATCH_INSTANCE, WS_TYPE_PATCH_DEPLOYMENT_ENV].includes(message.type)) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if (WS_TYPE_PATCH_RECEIVED === message.type) {
        setSaving(false)
      }
    },
    onError: onWsError,
  })

  const editor = useEditorState(sock)

  sock.on(WS_TYPE_DEPLOYMENT_ENV_UPDATED, (message: DeploymentEnvUpdatedMessage) => {
    setDeployment({
      ...deployment,
      environment: message,
    })
  })

  sock.on(WS_TYPE_INSTANCE_UPDATED, (message: InstanceUpdatedMessage) => {
    const index = instances.findIndex(it => it.id === message.instanceId)
    if (index < 0) {
      sock.send(WS_TYPE_GET_INSTANCE, {
        id: message.instanceId,
      } as GetInstanceMessage)
      return
    }

    const oldOne = instances[index]
    const instance = mergeInstancePatch(oldOne, message)

    const newInstances = [...instances]
    newInstances[index] = instance

    setInstances(newInstances)
  })

  sock.on(WS_TYPE_INSTANCE, (message: InstanceMessage) => setInstances([...instances, message]))

  sock.on(WS_TYPE_INSTANCES_ADDED, (message: InstancesAddedMessage) => setInstances([...instances, ...message]))

  sock.on(WS_TYPE_IMAGE_DELETED, (message: ImageDeletedMessage) =>
    setInstances(instances.filter(it => it.image.id !== message.imageId)),
  )

  const onDeploymentEdited = dep => {
    setDeployment(dep)
    setEditState('details')
  }

  const onEnvironmentEdited = environment => {
    setDeployment({
      ...deployment,
      environment,
    })
    envEditThrottle(() => {
      sock.send(WS_TYPE_PATCH_DEPLOYMENT_ENV, environment)
    })
  }

  const onInvalidateSecrets = (secrets: DeploymentInvalidatedSecrets[]) => {
    const newInstances = instances.map(it => {
      const invalidated = secrets.find(sec => sec.instanceId === it.id)
      if (!invalidated) {
        return it
      }

      return {
        ...it,
        config: {
          ...(it.config ?? {}),
          secrets: (it.config?.secrets ?? []).map(secret => {
            if (invalidated.invalid.includes(secret.id)) {
              return {
                ...secret,
                encrypted: false,
                publicKey: '',
                value: '',
              }
            }

            return secret
          }),
        },
      }
    })

    setInstances(newInstances)
  }

  return [
    {
      deployment,
      project,
      version,
      node,
      instances,
      saving,
      editState,
      mutable,
      deployable,
      deletable,
      copiable,
      editor,
      viewMode,
      sock,
      showDeploymentLog,
    },
    {
      setEditState,
      onDeploymentEdited,
      onEnvironmentEdited,
      setViewMode,
      onInvalidateSecrets,
    },
  ]
}

export default useDeploymentState
