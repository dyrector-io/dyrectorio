import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentDetails,
  DeploymentEnvUpdatedMessage,
  deploymentIsMutable,
  DeploymentRoot,
  DyoNode,
  GetInstanceMessage,
  ImageDeletedMessage,
  Instance,
  InstanceMessage,
  InstancesAddedMessage,
  InstanceUpdatedMessage,
  NodeStatusMessage,
  ProductDetails,
  VersionDetails,
  WS_TYPE_DEPLOYMENT_ENV_UPDATED,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_INSTANCE_UPDATED,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_PATCH_DEPLOYMENT_ENV,
  WS_TYPE_PATCH_INSTANCE,
} from '@app/models'
import { deploymentWsUrl, WS_NODES } from '@app/routes'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useState } from 'react'

export type DeploymentStateOptions = {
  deployment: DeploymentRoot
  onWsError: (error: Error) => void
}

export type DeploymentState = {
  deployment: DeploymentDetails
  product: ProductDetails
  node: DyoNode
  version: VersionDetails
  instances: Instance[]
  mutable: boolean
  saving: boolean
  editing: boolean
  editor: EditorState
  viewMode: ViewMode
  sock: WebSocketClientEndpoint
}

export type DeploymentActions = {
  setEditing: (editing: boolean) => void
  onDeploymentEdited: (editedDeployment: DeploymentDetails) => void
  setViewMode: (viewMode: ViewMode) => void
}

const mergeInstancePatch = (instance: Instance, message: InstanceUpdatedMessage): Instance => ({
  ...instance,
  overriddenConfig: {
    ...instance.overriddenConfig,
    ...message,
  },
})

const useDeploymentState = (options: DeploymentStateOptions): [DeploymentState, DeploymentActions] => {
  const { deployment: optionDeploy, onWsError } = options
  const { product, version } = optionDeploy

  const [deployment, setDeployment] = useState<DeploymentDetails>(optionDeploy)
  const [node, setNode] = useState(optionDeploy.node)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])
  const [viewMode, setViewMode] = useState<ViewMode>('tile')

  const mutable = deploymentIsMutable(deployment.status)

  const nodesSock = useWebSocket(WS_NODES)
  nodesSock.on(WS_TYPE_NODE_STATUS, (message: NodeStatusMessage) => {
    if (message.nodeId !== node.id) {
      return
    }

    setNode({
      ...node,
      status: message.status,
      address: message.address,
    })
  })

  const sock = useWebSocket(deploymentWsUrl(product.id, version.id, deployment.id), {
    onSend: message => {
      if ([WS_TYPE_PATCH_INSTANCE, WS_TYPE_PATCH_DEPLOYMENT_ENV].includes(message.type)) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if ([WS_TYPE_INSTANCE_UPDATED, WS_TYPE_DEPLOYMENT_ENV_UPDATED].includes(message.type)) {
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
    setEditing(false)
  }

  return [
    {
      deployment,
      product,
      version,
      node,
      instances,
      sock,
      saving,
      editing,
      mutable,
      editor,
      viewMode,
    },
    {
      setEditing,
      onDeploymentEdited,
      setViewMode,
    },
  ]
}

export default useDeploymentState
