import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  NodeDetails,
  NodeEventMessage,
  NodeInstall,
  NodeType,
  UpdateNodeAgentMessage,
  WS_TYPE_NODE_EVENT,
  WS_TYPE_UPDATE_AGENT,
} from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import toast from 'react-hot-toast'
import DyoNodeSetup from './dyo-node-setup'
import EditNodeCard from './edit-node-card'
import NodeConnectionCard from './node-connection-card'
import useNodeState from './use-node-state'
import { SubmitHook } from '@app/hooks/use-submit'
import { QA_DIALOG_LABEL_KICK_AGENT, QA_DIALOG_LABEL_REVOKE_NODE_TOKEN } from 'quality-assurance'

interface EditNodeSectionProps {
  className?: string
  node?: NodeDetails
  onNodeEdited: (node: NodeDetails, shouldClose?: boolean) => void
  submit?: SubmitHook
}

const EditNodeSection = (props: EditNodeSectionProps) => {
  const { className, node: propsNode, onNodeEdited: propsOnNodeEdited, submit } = props

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()

  const [revokeModalConfig, confirmTokenRevoke] = useConfirmation()

  const [node, setNode] = useNodeState(
    propsNode ??
      ({
        name: '',
        description: '',
        type: 'docker',
        status: 'unreachable',
        inUse: false,
      } as NodeDetails),
  )

  const editing = !!node.id

  const handleApiError = defaultApiErrorHandler(t)

  const onNodeEdited = (newNode: NodeDetails, shouldClose?: boolean) => {
    setNode(newNode)
    propsOnNodeEdited(newNode, shouldClose)
  }

  const socket = useWebSocket(routes.node.socket())
  socket.on(WS_TYPE_NODE_EVENT, (message: NodeEventMessage) => {
    if (message.id !== node.id) {
      return
    }

    if (message.error) {
      toast(t('updateError', { error: message.error }), {
        className: '!bg-warning-orange !text-white',
      })
    }

    const newNode = {
      ...node,
      address: message.address ?? node.address,
      status: message.status,
      hasToken: message.status === 'connected' || node.hasToken,
      install: message.status === 'connected' ? null : node.install,
    } as NodeDetails

    onNodeEdited(newNode)
  })

  const onNodeInstallChanged = (install: NodeInstall) => {
    const newNode = {
      ...node,
      install,
    }

    onNodeEdited(newNode)
  }

  const onRevokeToken = async () => {
    const confirmed = await confirmTokenRevoke({
      qaLabel: QA_DIALOG_LABEL_REVOKE_NODE_TOKEN,
      title: t('tokens:areYouSureRevoke'),
      confirmText: t('tokens:revoke'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.node.api.token(node.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    const newNode = {
      ...node,
      status: 'unreachable',
      version: null,
      hasToken: false,
      install: null,
    } as NodeDetails

    setNode(newNode)
    onNodeEdited(newNode)
  }

  const onKickAgent = async () => {
    const confirmed = await confirmTokenRevoke({
      qaLabel: QA_DIALOG_LABEL_KICK_AGENT,
      title: t('areYouSureKickAgent'),
      description: t('kickingAnAgentWillStopIt'),
      confirmText: t('kick'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.node.api.kick(node.id), {
      method: 'POST',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    const newNode = {
      ...node,
      status: 'unreachable',
      version: null,
    } as NodeDetails

    setNode(newNode)
    onNodeEdited(newNode)
  }

  const onNodeTypeChanged = (type: NodeType): void => {
    setNode({
      ...node,
      type,
    })
  }

  const onUpdateNode = () => {
    socket.send(WS_TYPE_UPDATE_AGENT, {
      id: node.id,
    } as UpdateNodeAgentMessage)

    setNode({
      ...node,
      status: 'updating',
    })
  }

  return (
    <>
      <div className={clsx(className, 'flex flex-row gap-4')}>
        <EditNodeCard className="w-1/2 p-8" submit={submit} onNodeEdited={onNodeEdited} node={node} />

        <div className="flex flex-col flex-grow w-1/2">
          {node.hasToken && <NodeConnectionCard className="mb-4 p-6" node={node} />}

          {!editing ? (
            <DyoCard className="h-full text-bright p-8">{t('youCanInstall')}</DyoCard>
          ) : node.hasToken ? (
            <DyoCard className="flex flex-col h-full p-8 text-bright">
              <DyoHeading element="h4" className="text-lg text-bright">
                {t('agentSettings')}
              </DyoHeading>

              {node.updatable && (
                <span className="mt-4">{t(node.status === 'outdated' ? 'updateRequired' : 'updateAvailable')}</span>
              )}

              <div className="flex flex-row gap-4 mt-4">
                {node.hasToken && (
                  <DyoButton className="px-6" secondary onClick={onRevokeToken}>
                    {t('tokens:revoke')}
                  </DyoButton>
                )}

                <DyoButton
                  className="px-6"
                  secondary
                  danger={node.status === 'outdated'}
                  onClick={onUpdateNode}
                  disabled={!node.updatable}
                >
                  <span className="flex">
                    {t('update')}
                    {node.status === 'updating' && <LoadingIndicator className="inline-block ml-2" />}
                  </span>
                </DyoButton>

                <DyoButton
                  className="px-6"
                  color="bg-error-red"
                  onClick={onKickAgent}
                  disabled={node.status === 'unreachable'}
                >
                  {t('kick')}
                </DyoButton>
              </div>
            </DyoCard>
          ) : (
            <DyoNodeSetup
              node={node}
              onNodeTypeChanged={onNodeTypeChanged}
              onNodeInstallChanged={onNodeInstallChanged}
            />
          )}
        </div>
      </div>

      <DyoConfirmationModal config={revokeModalConfig} className="w-1/4" />
    </>
  )
}

export default EditNodeSection
