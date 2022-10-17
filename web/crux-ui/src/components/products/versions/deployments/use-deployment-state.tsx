import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import useWebSocket from '@app/hooks/use-websocket'
import {
  CopyDeploymentResponse,
  DeploymentDetails,
  DeploymentEnvUpdatedMessage,
  deploymentIsCopyable,
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
import { deploymentCopyUrl, deploymentUrl, deploymentWsUrl, WS_NODES } from '@app/routes'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import { useState } from 'react'

export type DeploymentStateOptions = {
  deployment: DeploymentRoot
  onApiError: (res: Response) => void
  onWsError: (error: Error) => void
}

export type DeploymentState = {
  deployment: DeploymentDetails
  product: ProductDetails
  node: DyoNode
  version: VersionDetails
  instances: Instance[]
  mutable: boolean
  copyable: boolean
  saving: boolean
  editing: boolean
  editor: EditorState
  viewMode: ViewMode
  confirmationModal: DyoConfirmationModalConfig
  sock: WebSocketClientEndpoint
}

export type DeploymentActions = {
  setEditing: (editing: boolean) => void
  onDeploymentEdited: (editedDeployment: DeploymentDetails) => void
  onCopyDeployment: () => Promise<string>
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
  const { deployment: optionDeploy, onWsError, onApiError } = options
  const { product, version } = optionDeploy

  const [deployment, setDeployment] = useState<DeploymentDetails>(optionDeploy)
  const [node, setNode] = useState(optionDeploy.node)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])
  const [viewMode, setViewMode] = useState<ViewMode>('tile')
  const [confirmationModal, confirm] = useConfirmation()

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

  const postCopyDeployment = async (options?: { overwrite?: boolean }): Promise<[string, number]> => {
    const res = await fetch(deploymentCopyUrl(product.id, version.id, deployment.id, options?.overwrite), {
      method: 'POST',
    })

    if (!res.ok) {
      onApiError(res)
      return null
    }

    if (res.status === 412) {
      return [null, res.status]
    }

    const json = (await res.json()) as CopyDeploymentResponse
    return [json.id, res.status]
  }

  const onCopyDeployment = async (): Promise<string> => {
    let [newDeploymentId, resStatus] = await postCopyDeployment()

    if (resStatus === 412) {
      const confirmed = await confirm()
      if (!confirmed) {
        return null
      }

      ;[newDeploymentId, resStatus] = await postCopyDeployment({
        overwrite: true,
      })
    }

    return deploymentUrl(product.id, version.id, newDeploymentId)
  }

  return [
    {
      deployment,
      product,
      version,
      node,
      instances,
      saving,
      editing,
      mutable,
      copyable: deploymentIsCopyable(deployment.status),
      editor,
      viewMode,
      confirmationModal,
      sock,
    },
    {
      setEditing,
      onDeploymentEdited,
      onCopyDeployment,
      setViewMode,
    },
  ]
}

export default useDeploymentState
