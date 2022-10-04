import useEditorState, { EditorOptions } from '@app/components/editor/use-editor-state'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import { CompleteContainerConfig, ContainerConfig, UniqueKeyValue } from '@app/models'
import { fold } from '@app/utils'
import { completeContainerConfigSchema } from '@app/validations'
import clsx from 'clsx'
import { CSSProperties, useCallback, useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

type EditImageJsonActionType = 'config-change' | 'set-content'

type EditImageJsonAction = {
  type: EditImageJsonActionType
  content?: CompleteContainerConfig
  config?: ContainerConfig
}

const DEFAULT_CONFIG = completeContainerConfigSchema.getDefault() as any as CompleteContainerConfig

const keyValueArrayToJson = (envs: UniqueKeyValue[]): Record<string, string> =>
  fold(envs, {}, (prev, it) => {
    if (!prev[it.key]) {
      prev[it.key] = it.value
    }

    return prev
  })

const imageConfigToCompleteContainerConfig = (
  currentConfig: CompleteContainerConfig,
  imageConfig: ContainerConfig,
): CompleteContainerConfig => {
  if (!imageConfig) {
    return currentConfig ?? DEFAULT_CONFIG
  }

  const config: CompleteContainerConfig = {
    ...(imageConfig.config ?? currentConfig ?? DEFAULT_CONFIG),
    name: imageConfig.name ?? currentConfig.name,
    environment: currentConfig?.environment ?? {},
    capabilities: currentConfig?.capabilities ?? {},
    secrets: currentConfig?.secrets ?? {},
  }

  if (imageConfig.environment) {
    config.environment = keyValueArrayToJson(imageConfig.environment)
  }

  if (imageConfig.capabilities) {
    config.capabilities = keyValueArrayToJson(imageConfig.capabilities)
  }

  return config
}

const reducer = (state: CompleteContainerConfig, action: EditImageJsonAction): CompleteContainerConfig => {
  const { type } = action

  if (type === 'config-change') {
    return imageConfigToCompleteContainerConfig(state, action.config)
  }
  if (type === 'set-content') {
    return action.content
  }
  throw Error(`Invalid EditImageJson action: ${type}`)
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: Record<string, string>): UniqueKeyValue[] => {
  if (!json || Object.entries(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  Object.entries(json).forEach(entry => {
    const [key, value] = entry

    const byKey = items.find(it => it.key === key)
    if (!byKey) {
      const byValue = items.find(it => it.value === value)

      result.push({
        key,
        value,
        id: byValue?.id ?? uuid(),
      })

      modified = true
    } else {
      if (byKey.value !== value) {
        modified = true
      }

      result.push({
        key,
        value,
        id: byKey.id,
      })
    }
  })

  const jsonKeys = Object.keys(json)
  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : undefined
}

interface EditImageJsonProps {
  disabled?: boolean
  className?: string
  config: ContainerConfig
  editorOptions: EditorOptions
  disabledContainerNameEditing?: boolean
  onPatch: (config: Partial<ContainerConfig>) => void
  onParseError?: (err: Error) => void
}

const EditImageJson = (props: EditImageJsonProps) => {
  const {
    disabled,
    editorOptions,
    className,
    config,
    disabledContainerNameEditing,
    onPatch,
    onParseError: propOnParseError,
  } = props

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const editorId = 'json-config'

  const [state, dispatch] = useReducer(reducer, imageConfigToCompleteContainerConfig(null, config))
  const [editorState, editorActions] = useEditorState(editorId, editorOptions, disabled)

  const onChange = useCallback(
    (newConfig: CompleteContainerConfig) => {
      throttle(() => {
        onPatch({
          config: newConfig,
          name: newConfig.name,
          environment: mergeKeyValuesWithJson(config?.environment ?? [], newConfig?.environment),
          capabilities: mergeKeyValuesWithJson(config?.capabilities ?? [], newConfig?.capabilities),
        })

        dispatch({
          type: 'set-content',
          content: newConfig,
        })
      })
    },
    [throttle, config?.environment, config?.capabilities, onPatch],
  )

  const onParseError = useCallback(
    (err: Error) => {
      throttle(CANCEL_THROTTLE)

      propOnParseError(err)
    },
    [throttle, propOnParseError],
  )

  useEffect(
    () =>
      dispatch({
        type: 'config-change',
        config,
      }),
    [config],
  )

  if (disabledContainerNameEditing) {
    delete state.name
  }

  const { highlightColor, focused } = editorState

  const style: CSSProperties =
    highlightColor && focused
      ? {
          outline: 'solid',
          outlineColor: highlightColor,
        }
      : null

  return (
    <JsonEditor
      id={editorId}
      className={clsx('h-full overflow-y-auto', className)}
      disabled={disabled}
      value={state}
      onChange={onChange}
      onParseError={onParseError}
      onFocus={editorActions.onFocus}
      onBlur={editorActions.onBlur}
      style={style}
    />
  )
}

export default EditImageJson
