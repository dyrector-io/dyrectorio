import { MessageType } from '@app/elements/dyo-input'
import useRepatch from '@app/hooks/use-repatch'

import { UniqueKeyValue } from '@app/models'
import { getValidationError } from '@app/validations'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { HTMLInputTypeAttribute, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import * as yup from 'yup'
import MultiInput from '../editor/multi-input'
import { ItemEditorState } from '../editor/use-item-editor-state'
import ConfigSectionLabel from '../products/versions/images/config/config-section-label'

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

const setItems = (items: UniqueKeyValue[]) => (): UniqueKeyValue[] => items

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

interface KeyValueInputProps {
  disabled?: boolean
  valueDisabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  items: UniqueKeyValue[]
  keyPlaceholder?: string
  valuePlaceholder?: string
  onChange: (items: UniqueKeyValue[]) => void
  onResetSection?: VoidFunction
  type?: HTMLInputTypeAttribute | undefined
  editorOptions: ItemEditorState
  hint?: { hintValidation: yup.BaseSchema; hintText: string }
}

const KeyValueInput = (props: KeyValueInputProps) => {
  const {
    label,
    labelClassName,
    disabled,
    className,
    items,
    valueDisabled,
    hint,
    editorOptions,
    onChange: propsOnChange,
    onResetSection: propsOnResetSection,
    keyPlaceholder,
    valuePlaceholder,
    type,
  } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useRepatch(items ?? [])

  const stateToElements = (keyValues: UniqueKeyValue[]) => {
    const result = []

    keyValues.forEach(item => {
      const keyUniqueErr = result.find(it => it.key === item.key) ? t('keyMustUnique') : null
      const hintErr = !keyUniqueErr && hint ? getValidationError(hint.hintValidation, item.key) : null
      result.push({
        ...item,
        message: keyUniqueErr ?? (hintErr ? hint.hintText : null),
        messageType: (keyUniqueErr ? 'error' : 'info') as MessageType,
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
    dispatch(mergeItems([]))

    propsOnResetSection()
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { key, value, message, messageType } = entry

    const keyId = `${entry.id}-key`
    const valueId = `${entry.id}-value`

    return (
      <div key={entry.id} className="flex flex-row flex-grow p-2">
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
            message={message}
            type={type}
            messageType={messageType}
            onPatch={it => onChange(index, it, value)}
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
          />
        </div>
      </div>
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
    </div>
  )
}

export default KeyValueInput
