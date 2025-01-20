import useEditorState, { EditorState } from '@app/components/editor/use-editor-state'
import useNodeState from '@app/components/nodes/use-node-state'
import { ViewMode } from '@app/components/shared/view-mode-toggle'
import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import usePersistedViewMode from '@app/hooks/use-persisted-view-mode'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DeploymentDetails,
  deploymentIsCopiable,
  deploymentIsDeletable,
  deploymentIsDeployable,
  deploymentIsMutable,
  deploymentLogVisible,
  DeploymentRoot,
  DeploymentToken,
  DyoNode,
  ImageDeletedMessage,
  Instance,
  instanceCreatedMessageToInstance,
  InstancesAddedMessage,
  NodeEventMessage,
  ProjectDetails,
  VersionDetails,
  WebSocketSaveState,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_NODE_EVENT,
} from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import useTranslation from 'next-translate/useTranslation'
import { QA_DIALOG_LABEL_REVOKE_DEPLOY_TOKEN } from 'quality-assurance'
import { useState } from 'react'

export type DeploymentEditState = 'details' | 'edit' | 'copy' | 'create-token'

export type DeploymentStateOptions = {
  deployment: DeploymentRoot
  onWsError: (error: Error) => void
  onApiError: (error: Response) => void
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
  saveState: WebSocketSaveState
  editState: DeploymentEditState
  editor: EditorState
  viewMode: ViewMode
  sock: WebSocketClientEndpoint
  showDeploymentLog: boolean
  confirmationModal: DyoConfirmationModalConfig
  deployInstances: string[]
}

export type DeploymentActions = {
  setEditState: (state: DeploymentEditState) => void
  onDeploymentEdited: (editedDeployment: DeploymentDetails) => void
  setViewMode: (viewMode: ViewMode) => void
  onDeploymentTokenCreated: (token: DeploymentToken) => void
  onRevokeDeploymentToken: VoidFunction
  onInstanceSelected: (id: string, deploy: boolean) => void
  onAllInstancesToggled: (deploy: boolean) => void
}

const useDeploymentState = (options: DeploymentStateOptions): [DeploymentState, DeploymentActions] => {
  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const { deployment: optionDeploy, onWsError, onApiError } = options
  const { project, version } = optionDeploy

  const [deployment, setDeployment] = useState<DeploymentDetails>(optionDeploy)
  const [node, setNode] = useNodeState(optionDeploy.node)
  const [saveState, setSaveState] = useState<WebSocketSaveState>('disconnected')
  const [editState, setEditState] = useState<DeploymentEditState>('details')
  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])
  const [viewMode, setViewMode] = usePersistedViewMode({ initialViewMode: 'list', pageName: 'deployments' })
  const [confirmationModal, confirm] = useConfirmation()
  const [deployInstances, setDeployInstances] = useState<string[]>(deployment.instances?.map(it => it.id) ?? [])

  const mutable = deploymentIsMutable(deployment.status, version.type)
  const deployable = deploymentIsDeployable(deployment.status, version.type)
  const deletable = deploymentIsDeletable(deployment.status)
  const copiable = deploymentIsCopiable(deployment.status)
  const showDeploymentLog = deploymentLogVisible(deployment.status)

  const nodesSock = useWebSocket(routes.node.socket())
  nodesSock.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    if (message.id !== node.id) {
      return
    }

    setNode({
      ...node,
      status: message.status,
      address: message.address,
    })
  })

  const sock = useWebSocket(routes.deployment.detailsSocket(deployment.id), {
    onOpen: () => setSaveState('connected'),
    onClose: () => setSaveState('disconnected'),
    onError: onWsError,
  })

  const editor = useEditorState(sock)

  sock.on(WS_TYPE_INSTANCES_ADDED, (message: InstancesAddedMessage) =>
    setInstances([...instances, ...message.map(it => instanceCreatedMessageToInstance(it))]),
  )

  sock.on(WS_TYPE_IMAGE_DELETED, (message: ImageDeletedMessage) =>
    setInstances(instances.filter(it => it.image.id !== message.imageId)),
  )

  const onDeploymentEdited = dep => {
    setDeployment(dep)
    setEditState('details')
  }

  const onDeploymentTokenCreated = (token: DeploymentToken) => {
    setDeployment({
      ...deployment,
      token,
    })
    setEditState('details')
  }

  const onRevokeDeploymentToken = async () => {
    const confirmed = await confirm({
      qaLabel: QA_DIALOG_LABEL_REVOKE_DEPLOY_TOKEN,
      title: t('common:areYouSure'),
      description: t('tokens:areYouSureRevoke'),
      confirmText: t('tokens:revoke'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.deployment.api.token(deployment.id), { method: 'DELETE' })

    if (!res.ok) {
      onApiError(res)
      return
    }

    setDeployment({
      ...deployment,
      token: null,
    })
  }

  const onInstanceSelected = (id: string, deploy: boolean) => {
    if ((deploy && deployInstances.includes(id)) || (!deploy && !deployInstances.includes(id))) {
      return
    }

    setDeployInstances(deploy ? [...deployInstances, id] : [...deployInstances.filter(it => it !== id)])
  }

  const onAllInstancesToggled = (deploy: boolean) => {
    setDeployInstances(deploy ? instances.map(it => it.id) : [])
  }

  return [
    {
      deployment,
      project,
      version,
      node,
      instances,
      saveState,
      editState,
      mutable,
      deployable,
      deletable,
      copiable,
      editor,
      viewMode,
      sock,
      showDeploymentLog,
      confirmationModal,
      deployInstances,
    },
    {
      setEditState,
      onDeploymentEdited,
      setViewMode,
      onDeploymentTokenCreated,
      onRevokeDeploymentToken,
      onInstanceSelected,
      onAllInstancesToggled,
    },
  ]
}

export default useDeploymentState
