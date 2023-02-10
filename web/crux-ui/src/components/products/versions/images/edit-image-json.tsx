import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import useMultiInputState from '@app/components/editor/use-multi-input-state'
import JsonEditor from '@app/components/shared/json-editor-dynamic-module'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import { editIdOf } from '@app/models'
import clsx from 'clsx'
import { CSSProperties, useCallback, useState } from 'react'

interface EditImageJsonProps<Config, Json> {
  disabled?: boolean
  className?: string
  config: Config
  editorOptions: ItemEditorState
  onPatch: (config: Json) => void
  onParseError: (err: Error) => void
  convertConfigToJson: (config: Config) => Json
}

const JSON_EDITOR_COMPARATOR = <Json,>(one: Json, other: Json): boolean => JSON.stringify(one) === JSON.stringify(other)

const EditImageJson = <Config, Json>(props: EditImageJsonProps<Config, Json>) => {
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

  const onMergeValues = (remote: Json, local: Json): Json => {
    if (!jsonError && JSON.stringify(remote) !== JSON.stringify(local)) {
      onPatch(local)
    }

    return local
  }

  const id = editIdOf(editorOptions.itemId, 'json-config')

  const [editorState, editorActions] = useMultiInputState({
    id,
    value: convertConfigToJson(config),
    editorOptions,
    onMergeValues,
    disabled,
    onCompareValues: JSON_EDITOR_COMPARATOR,
  })

  const onChange = (newConfig: Json) => {
    setJsonError(false)

    // TODO (@m8vago): Do we need this throttle?
    throttle(() => {
      onPatch(newConfig)
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
      id={id}
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
