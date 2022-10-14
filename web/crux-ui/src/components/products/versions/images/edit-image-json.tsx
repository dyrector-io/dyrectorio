import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import useMultiInputState from '@app/components/editor/use-multi-input-state'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import { CompleteContainerConfig, ContainerConfig, InstanceContainerConfig, UniqueKeyValue } from '@app/models'
import { fold } from '@app/utils'
import { completeContainerConfigSchema } from '@app/validations'
import clsx from 'clsx'
import { CSSProperties, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

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
  imageConfig: ContainerConfig | InstanceContainerConfig,
): CompleteContainerConfig => {
  if (!imageConfig) {
    return currentConfig ?? DEFAULT_CONFIG
  }

  const config: ContainerConfig = {
    ...(imageConfig ?? currentConfig ?? DEFAULT_CONFIG),
    capabilities: currentConfig?.capabilities,
  }

  if (imageConfig.environments) {
    config.environments = imageConfig.environments
  }

  if (imageConfig.capabilities) {
    config.capabilities = imageConfig.capabilities
  }

  return config
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
  config: ContainerConfig | InstanceContainerConfig
  editorOptions: EditorStateOptions
  onPatch: (config: Partial<ContainerConfig | InstanceContainerConfig>) => void
  onParseError?: (err: Error) => void
}

const EDITOR_ID = 'json-config'
const JSON_EDITOR_COMPARATOR = (one: CompleteContainerConfig, other: CompleteContainerConfig): boolean =>
  JSON.stringify(one) === JSON.stringify(other)

const EditImageJson = (props: EditImageJsonProps) => {
  const { disabled, editorOptions, className, config, onPatch, onParseError: propOnParseError } = props

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const onMergeValues = (_: CompleteContainerConfig, local: CompleteContainerConfig): CompleteContainerConfig => {
    onPatch({
      config: local,
      name: local.name,
      environment: mergeKeyValuesWithJson(config?.environment ?? [], local?.environment),
      capabilities: mergeKeyValuesWithJson(config?.capabilities ?? [], local?.capabilities),
    })

    return local
  }

  const [editorState, editorActions] = useMultiInputState({
    id: EDITOR_ID,
    value: imageConfigToCompleteContainerConfig(null, config),
    editorOptions,
    onMergeValues,
    disabled,
    onCompareValues: JSON_EDITOR_COMPARATOR,
  })

  const onChange = (newConfig: CompleteContainerConfig) => {
    throttle(() => {
      onPatch({
        config: newConfig,
        name: newConfig.name,
        environment: mergeKeyValuesWithJson(config?.environment ?? [], newConfig?.environment),
        capabilities: mergeKeyValuesWithJson(config?.capabilities ?? [], newConfig?.capabilities),
      })
    })

    editorActions.onChange(newConfig)
  }

  const onParseError = useCallback(
    (err: Error) => {
      throttle(CANCEL_THROTTLE)

      propOnParseError(err)
    },
    [throttle, propOnParseError],
  )

  const { highlightColor } = editorState

  const style: CSSProperties = highlightColor
    ? {
        outline: 'solid',
        outlineColor: highlightColor,
      }
    : null

  return (
    <JsonEditor
      id={EDITOR_ID}
      className={clsx('h-full overflow-y-auto', className)}
      disabled={disabled}
      value={editorState.value}
      onChange={onChange}
      onParseError={onParseError}
      onFocus={editorActions.onFocus}
      onBlur={editorActions.onBlur}
      style={style}
    />
  )
}

export default EditImageJson
