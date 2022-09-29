import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { UniqueKeyValue } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

const EMPTY_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeyValue

type KeyValueElement = UniqueKeyValue & {
  message?: string
}

type KeyValueInputActionType = 'merge-items' | 'set-items'

type KeyValueInputAction = {
  type: KeyValueInputActionType
  items: UniqueKeyValue[]
}

const isCompletelyEmpty = (it: UniqueKeyValue) => it.key.trim().length < 1 && it.value.trim().length < 1

const pushEmptyLineIfNecessary = (items: UniqueKeyValue[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_KEY_VALUE_PAIR,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKeyValue[], action: KeyValueInputAction): UniqueKeyValue[] => {
  const { type } = action

  if (type === 'set-items') {
    const result = [...action.items]
    pushEmptyLineIfNecessary(result)
    return result
  }
  if (type === 'merge-items') {
    const updatedItems = action.items
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

    pushEmptyLineIfNecessary(result)
    return result
  }
  throw Error(`Invalid KeyValueInput action: ${type}`)
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
  type?: 'string' | 'number'
}

const KeyValueInput = (props: KeyValueInputProps) => {
  const {
    label,
    labelClassName,
    disabled,
    className,
    items,
    valueDisabled,
    onChange: propOnChange,
    keyPlaceholder,
    valuePlaceholder,
    type,
  } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useReducer(reducer, items)

  const stateToElements = (keyValues: UniqueKeyValue[]) => {
    const result = []

    keyValues.forEach(item =>
      result.push({
        ...item,
        message: result.find(it => it.key === item.key) ? t('keyMustUnique') : null,
      }),
    )

    return result as KeyValueElement[]
  }

  useEffect(
    () =>
      dispatch({
        type: 'merge-items',
        items,
      }),
    [items],
  )

  const onChange = (index: number, key: string, value: string) => {
    let newItems = [...state]

    const item = {
      id: state[index].id,
      key,
      value,
    }

    newItems[index] = item

    newItems = newItems.filter(it => !isCompletelyEmpty(it))

    propOnChange(newItems)
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { key, value, message } = entry

    return (
      <div key={entry.id} className="flex flex-row flex-grow p-1">
        <div className="w-5/12 ml-2">
          <DyoInput
            key={`${entry.id}-key`}
            disabled={disabled}
            className="w-full mr-2"
            grow
            placeholder={keyPlaceholder ?? t('key')}
            value={key}
            message={message}
            onChange={e => onChange(index, e.target.value, value)}
            type={type ?? 'string'}
          />
        </div>

        <div className="w-7/12 ml-2">
          <DyoInput
            key={`${entry.id}-value`}
            disabled={disabled || valueDisabled}
            className="w-full"
            grow
            placeholder={valuePlaceholder ?? t('value')}
            value={value}
            onChange={e => onChange(index, key, e.target.value)}
            type={type ?? 'string'}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!label ? null : (
        <DyoLabel className={clsx(labelClassName ?? 'text-bright mb-2 whitespace-nowrap')}>{label}</DyoLabel>
      )}

      {elements.map((it, index) => renderItem(it, index))}
    </div>
  )
}

export default KeyValueInput
