import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import useMultiInputState from '@app/components/editor/use-multi-input-state'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import { ContainerConfig, JsonConfig, mergeJsonConfigToContainerConfig } from '@app/models'
import clsx from 'clsx'
import { CSSProperties, useCallback, useState } from 'react'

interface EditImageJsonProps {
  disabled?: boolean
  className?: string
  config: ContainerConfig
  editorOptions: EditorStateOptions
  onPatch: (config: Partial<ContainerConfig>) => void
  onParseError: (err: Error) => void
  convertConfigToJson: (config: ContainerConfig) => JsonConfig
}

const EDITOR_ID = 'json-config'
const JSON_EDITOR_COMPARATOR = (one: JsonConfig, other: JsonConfig): boolean =>
  JSON.stringify(one) === JSON.stringify(other)

const EditImageJson = (props: EditImageJsonProps) => {
  const {
    disabled,
    editorOptions,
    className,
    config,
    onPatch,
    onParseError: propOnParseError,
    convertConfigToJson,
  } = props

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const [jsonError, setJsonError] = useState<boolean>(false)

  const onMergeValues = (_: JsonConfig, local: JsonConfig): JsonConfig => {
    if (!jsonError) {
      onPatch(mergeJsonConfigToContainerConfig(config, local))
    }

    return local
  }

  const [editorState, editorActions] = useMultiInputState({
    id: EDITOR_ID,
    value: convertConfigToJson(config),
    editorOptions,
    onMergeValues,
    disabled,
    onCompareValues: JSON_EDITOR_COMPARATOR,
  })

  const onChange = (newConfig: JsonConfig) => {
    setJsonError(false)
    throttle(() => {
      onPatch(mergeJsonConfigToContainerConfig(config, newConfig))
    })

    editorActions.onChange(newConfig)
  }

  const onParseError = useCallback(
    (err: Error) => {
      setJsonError(true)

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
