import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { useThrottleing } from '@app/hooks/use-throttleing'
import { CompleteContainerConfig, ContainerConfig, UniqueKeyValue } from '@app/models'
import { fold } from '@app/utils'
import { completeContainerConfigSchema } from '@app/validation'
import clsx from 'clsx'
import { useCallback, useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

interface EditImageJsonProps {
  disabled?: boolean
  className?: string
  config: ContainerConfig
  disabledContainerNameEditing?: boolean
  onPatch: (config: Partial<ContainerConfig>) => void
  onParseError?: (err: Error) => void
}

const EditImageJson = (props: EditImageJsonProps) => {
  const throttle = useThrottleing(IMAGE_WS_REQUEST_DELAY)

  const [state, dispatch] = useReducer(reducer, imageConfigToCompleteContainerConfig(null, props.config))

  const onChange = useCallback(
    (newConfig: CompleteContainerConfig) => {
      const { config } = props

      throttle(() => {
        props.onPatch({
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
    [throttle, props],
  )

  const onParseError = useCallback(
    (err: Error) => {
      // TODO @m8 why is this arrow function is empty?
      throttle(() => {})

      props.onParseError(err)
    },
    [throttle, props],
  )

  useEffect(
    () =>
      dispatch({
        type: 'config-change',
        config: props.config,
      }),
    [props.config],
  )

  if (props.disabledContainerNameEditing) {
    delete state.name
  }

  return (
    <JsonEditor
      className={clsx('flex flex-col flex-grow h-128', props.className)}
      disabled={props.disabled}
      value={state}
      onChange={onChange}
      onParseError={onParseError}
    />
  )
}

export default EditImageJson

type EditImageJsonActionType = 'config-change' | 'set-content'

type EditImageJsonAction = {
  type: EditImageJsonActionType
  content?: CompleteContainerConfig
  config?: ContainerConfig
}

const reducer = (state: CompleteContainerConfig, action: EditImageJsonAction): CompleteContainerConfig => {
  const type = action.type

  if (type === 'config-change') {
    return imageConfigToCompleteContainerConfig(state, action.config)
  } else if (type === 'set-content') {
    return action.content
  } else {
    throw Error(`Invalid EditImageJson action: ${type}`)
  }
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
  }

  if (imageConfig.environment) {
    config.environment = keyValueArrayToJson(imageConfig.environment)
  }

  if (imageConfig.capabilities) {
    config.capabilities = keyValueArrayToJson(imageConfig.capabilities)
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
