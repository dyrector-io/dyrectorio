import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import useMultiInputState from '@app/components/editor/use-multi-input-state'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import {
  ContainerConfig,
  InitContainer,
  InitContainerVolumeLink,
  InstanceJsonContainerConfig,
  JsonContainerConfig,
  JsonInitContainer,
  JsonKeyValue,
  UniqueKey,
  UniqueKeyValue,
} from '@app/models'
import { containerConfigSchema } from '@app/validations'
import clsx from 'clsx'
import { CSSProperties, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

const DEFAULT_CONFIG = containerConfigSchema.getDefault() as any as ContainerConfig

type JsonConfig = InstanceJsonContainerConfig | JsonContainerConfig

const keyValueArrayToJson = (list: UniqueKeyValue[]): JsonKeyValue =>
  list?.reduce((prev, it) => ({ ...prev, [it.key]: it.value }), {})

const keyArrayToJson = (list: UniqueKey[]): string[] => list?.map(it => it.key)

const simplify = <T,>(item: T): Omit<T, 'id'> => {
  const newItem: any = { ...item }
  delete newItem.id

  return newItem
}

const imageConfigToJsonContainerConfig = (
  currentConfig: JsonContainerConfig,
  imageConfig: ContainerConfig,
): JsonContainerConfig => {
  if (!imageConfig) {
    imageConfig = DEFAULT_CONFIG
  }

  const config: JsonContainerConfig = {
    ...currentConfig,
    ...imageConfig,
    commands: keyArrayToJson(imageConfig.commands),
    args: keyArrayToJson(imageConfig.args),
    networks: keyArrayToJson(imageConfig.networks),
    customHeaders: keyArrayToJson(imageConfig.customHeaders),
    extraLBAnnotations: keyValueArrayToJson(imageConfig.extraLBAnnotations),
    environments: keyValueArrayToJson(imageConfig.environments),
    capabilities: keyValueArrayToJson(imageConfig.capabilities),
    secrets: imageConfig.secrets?.map(it => it.key),
    portRanges: imageConfig.portRanges?.map(it => simplify(it)),
    ports: imageConfig.ports?.map(it => simplify(it)),
    logConfig: imageConfig.logConfig
      ? {
          ...imageConfig.logConfig,
          options: keyValueArrayToJson(imageConfig.logConfig?.options),
        }
      : null,
    initContainers: imageConfig.initContainers?.map(it =>
      simplify({
        ...it,
        command: keyArrayToJson(it.command),
        args: keyArrayToJson(it.args),
        environments: keyValueArrayToJson(it.environments),
        volumes: it.volumes?.map(vit => simplify(vit)),
      } as JsonInitContainer),
    ),
    importContainer: imageConfig.importContainer
      ? {
          ...imageConfig.importContainer,
          environments: keyValueArrayToJson(imageConfig.importContainer?.environments),
        }
      : null,
    volumes: imageConfig.volumes?.map(it => simplify(it)),
  }

  return config
}

const imageConfigToJsonInstanceConfig = (
  currentConfig: JsonContainerConfig,
  imageConfig: ContainerConfig,
): InstanceJsonContainerConfig => {
  const config = imageConfigToJsonContainerConfig(currentConfig, imageConfig)

  delete config.secrets

  return config as InstanceJsonContainerConfig
}

const mergeKeyValuesWithJson = (items: UniqueKeyValue[], json: JsonKeyValue): UniqueKeyValue[] => {
  if (!json || Object.keys(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  const jsonKeys = Object.keys(json)

  jsonKeys.forEach(key => {
    const value = json[key]

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

  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

const mergeKeysWithJson = (items: UniqueKey[], json: string[]): UniqueKey[] => {
  if (!json || Object.entries(json).length < 1) {
    return []
  }

  let modified = false
  const result = []
  json.forEach(entry => {
    const byKey = items.find(it => it.key === entry)
    if (!byKey) {
      result.push({
        key: entry,
        id: uuid(),
      })

      modified = true
    } else {
      if (byKey.key !== entry) {
        modified = true
      }

      result.push({
        key: entry,
        id: byKey.id,
      })
    }
  })

  const jsonKeys = Object.keys(json)
  const removed = items.filter(it => !jsonKeys.includes(it.key))
  if (removed.length > 0) {
    modified = true
  }

  return modified ? result : items
}

const merge = (serialized: ContainerConfig, json: JsonConfig): Partial<ContainerConfig> => {
  const config = {
    ...serialized,
    ...json,
    environments: mergeKeyValuesWithJson(serialized.environments, json.environments),
    extraLBAnnotations: mergeKeyValuesWithJson(serialized.extraLBAnnotations, json.extraLBAnnotations),
    capabilities: mergeKeyValuesWithJson(serialized.capabilities, json.capabilities),
    commands: mergeKeysWithJson(serialized.commands, json.commands),
    customHeaders: mergeKeysWithJson(serialized.customHeaders, json.customHeaders),
    networks: mergeKeysWithJson(serialized.networks, json.networks),
    args: mergeKeysWithJson(serialized.args, json.args),
    logConfig: json.logConfig
      ? {
          ...json.logConfig,
          options: mergeKeyValuesWithJson(serialized.logConfig?.options, json.logConfig?.options),
        }
      : null,
    initContainers: json.initContainers?.map(it => {
      const index = serialized.initContainers?.map(iit => iit.name).indexOf(it.name)

      if (index !== -1) {
        const prev = serialized.initContainers[index]

        return {
          ...prev,
          args: mergeKeysWithJson(prev.args, it.args),
          command: mergeKeysWithJson(prev.command, it.command),
          environments: mergeKeyValuesWithJson(prev.environments, it.environments),
          volumes: it.volumes?.map(vit => {
            const volumeIndex = prev.volumes?.map(pv => pv.name).indexOf(vit.name)
            const id = volumeIndex !== -1 ? prev.volumes[volumeIndex].id : uuid()

            return {
              ...vit,
              id,
            } as InitContainerVolumeLink
          }),
        } as InitContainer
      }

      return {
        ...it,
        id: uuid(),
        command: it.command?.map(cit => ({ id: uuid(), key: cit })),
        args: it.args ? it.args?.map(ait => ({ id: uuid(), key: ait })) : [],
        environments: Object.keys(it.environments ?? {}).map(eit => ({
          key: eit,
          value: it.environments[eit],
          id: uuid(),
        })),
        volumes: it.volumes?.map(vit => ({ ...vit, id: uuid() })),
      } as InitContainer
    }),
    ports: json.ports?.map(it => ({
      ...it,
      id: uuid(),
    })),
    portRanges: json.portRanges?.map(it => ({
      ...it,
      id: uuid(),
    })),
  } as Partial<ContainerConfig>

  if ((json as JsonContainerConfig).secrets) {
    config.secrets = (json as JsonContainerConfig).secrets.map(it => {
      const prev = serialized.secrets?.map(sit => sit.key).indexOf(it)

      return {
        id: prev !== -1 ? serialized.secrets[prev].id : uuid(),
        key: it,
        value: '',
      }
    })
  }

  return config
}

interface EditImageJsonProps {
  disabled?: boolean
  className?: string
  config: ContainerConfig
  editorOptions: EditorStateOptions
  onPatch: (config: Partial<ContainerConfig>) => void
  onParseError?: (err: Error) => void
  instanceEditor?: boolean
}

const EDITOR_ID = 'json-config'
const JSON_EDITOR_COMPARATOR = (one: JsonConfig, other: JsonConfig): boolean =>
  JSON.stringify(one) === JSON.stringify(other)

const EditImageJson = (props: EditImageJsonProps) => {
  const { disabled, editorOptions, className, config, onPatch, onParseError: propOnParseError, instanceEditor } = props

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const onMergeValues = (_: JsonConfig, local: JsonConfig): JsonConfig => {
    onPatch(merge(config, local))

    return local
  }

  const [editorState, editorActions] = useMultiInputState({
    id: EDITOR_ID,
    value: instanceEditor
      ? imageConfigToJsonInstanceConfig(null, config)
      : imageConfigToJsonContainerConfig(null, config),
    editorOptions,
    onMergeValues,
    disabled,
    onCompareValues: JSON_EDITOR_COMPARATOR,
  })

  const onChange = (newConfig: JsonConfig) => {
    throttle(() => {
      onPatch(merge(config, newConfig))
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
