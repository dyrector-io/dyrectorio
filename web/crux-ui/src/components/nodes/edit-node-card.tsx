import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useWebSocket from '@app/hooks/use-websocket'
import {
  CreateDyoNode,
  DyoNode,
  DyoNodeDetails,
  DyoNodeInstall,
  NodeStatusMessage,
  NodeType,
  UpdateDyoNode,
  UpdateNodeAgentMessage,
  WS_TYPE_NODE_STATUS,
  WS_TYPE_UPDATE_NODE_AGENT,
} from '@app/models'
import { API_NODES, nodeApiUrl, nodeTokenApiUrl, WS_NODES } from '@app/routes'
import { sendForm } from '@app/utils'
import { nodeSchema } from '@app/validations'
import clsx from 'clsx'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'
import toast from 'react-hot-toast'
import DyoNodeSetup from './dyo-node-setup'
import NodeConnectionCard from './node-connection-card'
import useNodeState from './use-node-state'

interface EditNodeCardProps {
  className?: string
  node?: DyoNodeDetails
  onNodeEdited: (node: DyoNode, shouldClose?: boolean) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditNodeCard = (props: EditNodeCardProps) => {
  const { className, node: propsNode, onNodeEdited, submitRef } = props

  const { t } = useTranslation('nodes')

  const [revokeModalConfig, confirmTokenRevoke] = useConfirmation()

  const [node, setNode] = useNodeState(
    propsNode ??
      ({
        name: '',
        description: '',
        type: 'docker',
        status: 'unreachable',
      } as DyoNodeDetails),
  )

  const editing = !!node.id

  const handleApiError = defaultApiErrorHandler(t)

  const socket = useWebSocket(WS_NODES)
  socket.on(WS_TYPE_NODE_STATUS, (message: NodeStatusMessage) => {
    if (message.nodeId !== node.id) {
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
      hasToken: message.status === 'running' || node.hasToken,
      install: null,
    } as DyoNodeDetails

    setNode(newNode)
    onNodeEdited(newNode)
  })

  const onNodeInstallChanged = (install: DyoNodeInstall) => {
    const newNode = {
      ...node,
      install,
    }

    setNode(newNode)
    onNodeEdited(newNode)
  }

  const onRevokeToken = () =>
    confirmTokenRevoke(async () => {
      const res = await fetch(nodeTokenApiUrl(node.id), {
        method: 'DELETE',
      })

      if (!res.ok) {
        handleApiError(res)
        return
      }

      const newNode = {
        ...node,
        status: 'unreachable',
        version: null,
        hasToken: false,
        install: null,
      } as DyoNodeDetails

      setNode(newNode)
      onNodeEdited(newNode)
    })

  const onNodeTypeChanged = (type: NodeType): void => {
    setNode({
      ...node,
      type,
    })
  }

  const onUpdateNode = () => {
    socket.send(WS_TYPE_UPDATE_NODE_AGENT, {
      id: node.id,
    } as UpdateNodeAgentMessage)
  }

  const formik = useFormik({
    validationSchema: nodeSchema,
    initialValues: node,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateDyoNode | UpdateDyoNode = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', API_NODES, body as CreateDyoNode)
        : sendForm('PUT', nodeApiUrl(node.id), body as UpdateDyoNode))

      if (res.ok) {
        let result: DyoNodeDetails
        if (res.status !== 204) {
          const json = await res.json()
          result = {
            ...json,
            status: node.status,
          } as DyoNodeDetails
        } else {
          result = {
            ...values,
            id: node.id,
            status: node.status,
            type: node.type,
          } as DyoNodeDetails

          if (values.name !== node.name) {
            const revokeScript = await fetch(nodeTokenApiUrl(node.id), {
              method: 'DELETE',
            })

            if (revokeScript.ok) {
              result = {
                ...result,
                hasToken: false,
                install: null,
                type: node.type,
              }
            }
          }
        }

        setNode(result)
        setSubmitting(false)
        onNodeEdited(result, editing)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  const inputClassName = 'my-2 w-full'

  return (
    <>
      <div className={clsx(className, 'flex flex-row gap-4')}>
        <DyoCard className="w-1/2 p-8">
          <DyoHeading element="h4" className="text-lg text-bright">
            {editing ? t('common:editName', { name: node.name }) : t('new')}
          </DyoHeading>

          <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

          <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
            <DyoInput
              name="name"
              label={t('common:name')}
              onChange={formik.handleChange}
              value={formik.values.name}
              required
              disabled
              grow
              message={formik.errors.name}
            />

            <div className={inputClassName}>
              <DyoLabel>{t('common:icon')}</DyoLabel>

              <DyoIconPicker name="icon" value={formik.values.icon} setFieldValue={formik.setFieldValue} />
            </div>

            <DyoTextArea
              className={clsx(inputClassName, 'h-48')}
              name="description"
              label={t('common:description')}
              onChange={formik.handleChange}
              value={formik.values.description}
              grow
            />

            <DyoButton className="hidden" type="submit" />
          </DyoForm>
        </DyoCard>

        <div className="flex flex-col flex-grow w-1/2">
          <NodeConnectionCard node={node} />

          <DyoCard className="flex-grow w-full p-8 mt-4">
            <DyoHeading element="h4" className="text-lg text-bright mb-4">
              {t('setup')}
            </DyoHeading>

            <div className="text-bright mb-4">
              <DyoHeading element="h4" className="text-md">
                {t('whatScriptDoesHeader')}
              </DyoHeading>

              <p className="text-light-eased ml-4">{t('scriptExplanation')}</p>
            </div>

            {node.install ? (
              <div className="text-bright mb-4">
                <DyoHeading element="h5" className="text-md">
                  {t('requirements')}
                </DyoHeading>

                {(t(`installReq.${node.type}`, null, { returnObjects: true }) as string[]).map((it, index) => (
                  <p key={`install-req-${index}`} className="text-light-eased max-w-lg ml-4">
                    - {it}
                  </p>
                ))}
              </div>
            ) : null}

            {!editing ? (
              <div className="text-bright font-bold mt-2">{t('saveYourNode')}</div>
            ) : node.hasToken && !node.install ? (
              <>
                <DyoButton className="px-6 mt-4 mr-auto" secondary onClick={onRevokeToken}>
                  {t('revoke')}
                </DyoButton>
                <DyoButton
                  className="px-6 mt-4 ml-4 mr-auto"
                  secondary
                  onClick={onUpdateNode}
                  disabled={node.status !== 'running'}
                >
                  {t('update')}
                </DyoButton>
              </>
            ) : (
              <DyoNodeSetup
                node={node}
                onNodeTypeChanged={onNodeTypeChanged}
                onNodeInstallChanged={onNodeInstallChanged}
              />
            )}
          </DyoCard>
        </div>
      </div>

      <DyoConfirmationModal
        config={revokeModalConfig}
        title={t('confirmRevoke')}
        confirmText={t('revoke')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </>
  )
}

export default EditNodeCard
