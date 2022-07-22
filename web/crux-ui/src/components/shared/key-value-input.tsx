import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { UniqueKeyValue } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

interface KeyValueInputProps {
  disabled?: boolean
  className?: string
  heading?: string
  items: UniqueKeyValue[]
  onChange: (items: UniqueKeyValue[]) => void
}

const EMPTY_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeyValue

const KeyValueInput = (props: KeyValueInputProps) => {
  const { t } = useTranslation('common')

  const { heading, disabled } = props

  const [state, dispatch] = useReducer(reducer, props.items)

  const stateToElements = (items: UniqueKeyValue[]) => {
    const result = []

    items.forEach(item =>
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
        items: props.items,
      }),
    [props.items],
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

    props.onChange(newItems)
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
        <div className="w-5/12">
          <DyoInput
            key={`${entry.id}-key`}
            disabled={disabled}
            className="w-full mr-2"
            grow
            placeholder={t('key')}
            value={key}
            message={message}
            onChange={e => onChange(index, e.target.value, value)}
          />
        </div>

        <div className="w-7/12 ml-2">
          <DyoInput
            key={`${entry.id}-value`}
            disabled={disabled}
            className="w-full"
            grow
            placeholder={t('value')}
            value={value}
            onChange={e => onChange(index, key, e.target.value)}
          />
        </div>
      </div>
    )
  }

  return (
    <form className={clsx(props.className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!heading ? null : (
        <DyoHeading element="h6" className="text-bright mt-4 mb-2">
          {heading}
        </DyoHeading>
      )}

      {elements.map((it, index) => renderItem(it, index))}
    </form>
  )
}

export default KeyValueInput

type KeyValueElement = UniqueKeyValue & {
  message?: string
}

type KeyValueInputActionType = 'merge-items' | 'set-items'

type KeyValueInputAction = {
  type: KeyValueInputActionType
  items: UniqueKeyValue[]
}

const isCompletelyEmpty = (it: UniqueKeyValue) => {
  return it.key.trim().length < 1 && it.value.trim().length < 1
}

const pushEmptyLineIfNecessary = (items: UniqueKeyValue[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_KEY_VALUE_PAIR,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKeyValue[], action: KeyValueInputAction): UniqueKeyValue[] => {
  const type = action.type

  if (type === 'set-items') {
    const result = [...action.items]
    pushEmptyLineIfNecessary(result)
    return result
  } else if (type === 'merge-items') {
    const updatedItems = action.items
    const result = [
      ...state.filter(old => !isCompletelyEmpty(old) && updatedItems.filter(it => old.id === it.id).length > 0),
    ]

    updatedItems.forEach(newItem => {
      const index = result.findIndex(it => it.id == newItem.id)

      if (index < 0) {
        result.push(newItem)
      } else {
        result[index] = newItem
      }
    })

    pushEmptyLineIfNecessary(result)
    return result
  } else {
    throw Error(`Invalid KeyValueInput action: ${type}`)
  }
}
