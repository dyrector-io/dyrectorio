import { CONFIG_BUNDLE_EDIT_WS_REQUEST_DELAY } from '@app/const'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ConfigBundleDetails,
  ConfigBundleUpdatedMessage,
  PatchConfigBundleMessage,
  WS_TYPE_CONFIG_BUNDLE_UPDATED,
  WS_TYPE_PATCH_CONFIG_BUNDLE,
  UniqueKeyValue,
  WS_TYPE_CONFIG_BUNDLE_PATCH_RECEIVED,
  WebSocketSaveState,
} from '@app/models'
import { useEffect, useState } from 'react'
import useEditorState from '../editor/use-editor-state'
import useItemEditorState, { ItemEditorState } from '../editor/use-item-editor-state'
import { toastWarning } from '@app/utils'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { ValidationError } from 'yup'
import { getValidationError, configBundlePatchSchema } from '@app/validations'
import EditorBadge from '../editor/editor-badge'

export type ConfigBundleStateOptions = {
  configBundle: ConfigBundleDetails
  onWsError: (error: Error) => void
  onApiError: (error: Response) => void
}

export type ConfigBundleState = {
  configBundle: ConfigBundleDetails
  editing: boolean
  saveState: WebSocketSaveState
  editorState: ItemEditorState
  fieldErrors: ValidationError[]
  topBarContent: React.ReactNode
}

export type ConfigBundleActions = {
  setEditing: (editing: boolean) => void
  onDelete: () => Promise<void>
  onEditEnv: (envs: UniqueKeyValue[]) => void
  onEditName: (name: string) => void
  onEditDescription: (description: string) => void
}

export const useConfigBundleDetailsState = (
  options: ConfigBundleStateOptions,
): [ConfigBundleState, ConfigBundleActions] => {
  const { configBundle: propsConfigBundle, onWsError, onApiError } = options

  const { t } = useTranslation('config-bundles')
  const router = useRouter()
  const routes = useTeamRoutes()

  const throttle = useThrottling(CONFIG_BUNDLE_EDIT_WS_REQUEST_DELAY)

  const [configBundle, setConfigBundle] = useState(propsConfigBundle)
  const [editing, setEditing] = useState(false)
  const [saveState, setSaveState] = useState<WebSocketSaveState>(null)
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>([])
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const sock = useWebSocket(routes.configBundle.detailsSocket(configBundle.id), {
    onOpen: () => setSaveState('connected'),
    onClose: () => setSaveState('disconnected'),
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_CONFIG_BUNDLE) {
        setSaveState('saving')
      }
    },
    onReceive: message => {
      if (message.type === WS_TYPE_CONFIG_BUNDLE_PATCH_RECEIVED) {
        setSaveState('saved')
      }
    },
    onError: onWsError,
  })

  const editor = useEditorState(sock)
  const editorState = useItemEditorState(editor, sock, configBundle.id)

  sock.on(WS_TYPE_CONFIG_BUNDLE_UPDATED, (message: ConfigBundleUpdatedMessage) => {
    setConfigBundle(it => ({
      ...it,
      ...message,
    }))
  })

  const onDelete = async (): Promise<void> => {
    const res = await fetch(routes.configBundle.api.details(configBundle.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.configBundle.list())
    } else if (res.status === 412) {
      toastWarning(t('inUse'))
    } else {
      onApiError(res)
    }
  }

  const onPatch = (patch: Partial<ConfigBundleDetails>) => {
    const newBundle = {
      ...configBundle,
      ...patch,
    }
    setConfigBundle(newBundle)

    const validationErrors = getValidationError(configBundlePatchSchema, newBundle, { abortEarly: false })?.inner ?? []
    setFieldErrors(validationErrors)

    if (validationErrors.length < 1) {
      throttle(() => {
        sock.send(WS_TYPE_PATCH_CONFIG_BUNDLE, {
          name: newBundle.name,
          description: newBundle.description,
          environment: newBundle.environment,
        } as PatchConfigBundleMessage)
      })
    }
  }

  const onEditEnv = (envs: UniqueKeyValue[]) => onPatch({ environment: envs })

  const onEditName = (name: string) => onPatch({ name })

  const onEditDescription = (description: string) => onPatch({ description })

  useEffect(() => {
    const reactNode = (
      <>
        {editorState.editors.map((it, index) => (
          <EditorBadge key={index} className="mr-2" editor={it} />
        ))}
      </>
    )

    setTopBarContent(reactNode)
  }, [editorState.editors])

  return [
    {
      configBundle,
      editing,
      saveState,
      editorState,
      fieldErrors,
      topBarContent,
    },
    {
      setEditing,
      onDelete,
      onEditEnv,
      onEditName,
      onEditDescription,
    },
  ]
}
