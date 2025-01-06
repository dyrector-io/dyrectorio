import { MessageType } from '@app/elements/dyo-input'
import useRepatch from '@app/hooks/use-repatch'

import DyoMessage from '@app/elements/dyo-message'
import { UniqueKeyValue } from '@app/models'
import { ErrorWithPath } from '@app/validations'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { Fragment, HTMLInputTypeAttribute, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import ConfigSectionLabel from '../container-configs/config-section-label'
import MultiInput from '../editor/multi-input'
import { ItemEditorState } from '../editor/use-item-editor-state'

const EMPTY_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeyValue

type KeyValueElement = UniqueKeyValue & {
  message?: string
  messageType: MessageType
}

const isCompletelyEmpty = (it: UniqueKeyValue) => it.key.trim().length < 1 && it.value.trim().length < 1

const generateEmptyLine = () => ({
  ...EMPTY_KEY_VALUE_PAIR,
  id: uuid(),
})

const setItems = (items: UniqueKeyValue[]) => (): UniqueKeyValue[] => {
  const newItems = items.filter(it => !isCompletelyEmpty(it))
  const emptyLine = generateEmptyLine()
  return [...newItems, emptyLine]
}

const mergeItems =
  (updatedItems: UniqueKeyValue[]) =>
  (state: UniqueKeyValue[]): UniqueKeyValue[] => {
    if (!updatedItems) {
      updatedItems = []
    }

    const lastLine = state.length > 0 ? state[state.length - 1] : null
    const emptyLine = !!lastLine && isCompletelyEmpty(lastLine) ? lastLine : generateEmptyLine()

    const result = [
      ...state.filter(old => !isCompletelyEmpty(old) && updatedItems.filter(it => old.id === it.id).length > 0),
    ]

    updatedItems.forEach(newItem => {
      const index = result.findIndex(it => it.id === newItem.id)

      if (index < 0) {
        result.push(newItem)
      } else {
        result[index] = newItem
      }
    })

    result.push(emptyLine)

    return result
  }

type KeyValueInputProps = {
  disabled?: boolean
  valueDisabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  items: UniqueKeyValue[]
  keyPlaceholder?: string
  valuePlaceholder?: string
  type?: HTMLInputTypeAttribute | undefined
  editorOptions: ItemEditorState
  message?: string
  messageType?: MessageType
  onChange: (items: UniqueKeyValue[]) => void
  onResetSection?: VoidFunction
  errors?: Record<string, string>
  findErrorMessage?: (index: number) => ErrorWithPath
}

const KeyValueInput = (props: KeyValueInputProps) => {
  const {
    label,
    labelClassName,
    disabled,
    className,
    items,
    valueDisabled,
    editorOptions,
    keyPlaceholder,
    valuePlaceholder,
    type,
    message,
    messageType,
    onChange: propsOnChange,
    onResetSection: propsOnResetSection,
    errors = {},
    findErrorMessage,
  } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useRepatch(items ?? [])

  const stateToElements = (keyValues: UniqueKeyValue[]) => {
    const result = []

    keyValues.forEach((item, index) => {
      const error = findErrorMessage?.call(null, index)
      const keyUniqueErr = result.find(it => it.key === item.key) ? t('keyMustUnique') : null
      const itemError = (!keyUniqueErr && errors[item.key]) ?? null
      result.push({
        ...item,
        message: keyUniqueErr ?? itemError ?? error?.message,
        messageType: 'error' as MessageType,
      })
    })

    return result as KeyValueElement[]
  }

  useEffect(() => dispatch(mergeItems(items)), [items, dispatch])

  const onChange = (index: number, key: string, value: string) => {
    const newItems = [...state]

    const item = {
      id: state[index].id,
      key,
      value,
    }

    newItems[index] = item

    const updatedItems = newItems.filter(it => !isCompletelyEmpty(it))

    propsOnChange(updatedItems)
    dispatch(setItems(newItems))
  }

  const onResetSection = () => {
    propsOnResetSection()
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { key, value, message: itemMessage, messageType: itemMessageType } = entry

    const keyId = `${entry.id}-key`
    const valueId = `${entry.id}-value`

    return (
      <Fragment key={entry.id}>
        <div className="flex flex-row flex-grow p-2">
          <div className="basis-5/12">
            <MultiInput
              key={keyId}
              id={keyId}
              disabled={disabled}
              editorOptions={editorOptions}
              className="w-full mr-2"
              grow
              placeholder={keyPlaceholder ?? t('key')}
              value={key ?? ''}
              type={type}
              onPatch={it => onChange(index, it, value)}
              invalid={!!itemMessage}
            />
          </div>

          <div className="basis-7/12 pl-2">
            <MultiInput
              key={valueId}
              id={valueId}
              disabled={disabled || valueDisabled}
              editorOptions={editorOptions}
              className="w-full"
              grow
              placeholder={valuePlaceholder ?? t('value')}
              value={value ?? ''}
              type={type}
              onPatch={it => onChange(index, key, it)}
              invalid={!!itemMessage}
            />
          </div>
        </div>
        {itemMessage && <DyoMessage message={itemMessage} messageType={itemMessageType} marginClassName="ml-2" />}
      </Fragment>
    )
  }

  const hasValue = !!items && items.length > 0

  return (
    <div className={clsx(className, 'flex flex-col')}>
      {!label ? null : (
        <ConfigSectionLabel
          disabled={disabled || !propsOnResetSection || !hasValue}
          onResetSection={onResetSection}
          labelClassName={labelClassName}
        >
          {label}
        </ConfigSectionLabel>
      )}

      {elements.map((it, index) => renderItem(it, index))}

      {message && <DyoMessage message={message} messageType={messageType} marginClassName="ml-2" />}
    </div>
  )
}

export default KeyValueInput
