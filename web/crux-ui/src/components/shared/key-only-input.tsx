import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { UniqueKey } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

interface KeyInputProps {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueKey[]
  keyPlaceholder?: string
  unique?: boolean
  onChange: (items: UniqueKey[]) => void
}

const EMPTY_KEY = {
  id: uuid(),
  key: '',
} as UniqueKey

type KeyElement = UniqueKey & {
  message?: string
}

type KeyInputActionType = 'merge-items' | 'set-items'

type KeyInputAction = {
  type: KeyInputActionType
  items: UniqueKey[]
}

const isCompletelyEmpty = (it: UniqueKey): boolean => !it.key || it.key.length < 1

const pushEmptyLineIfNecessary = (items: UniqueKey[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_KEY,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKey[], action: KeyInputAction): UniqueKey[] => {
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

  throw Error(`Invalid KeyInput action: ${type}`)
}

const KeyOnlyInput = (props: KeyInputProps) => {
  const { t } = useTranslation('common')

  const {
    label,
    labelClassName,
    description,
    disabled,
    items,
    className,
    keyPlaceholder,
    unique = true,
    onChange: parentOnChange,
  } = props

  const [state, dispatch] = useReducer(reducer, items)

  const stateToElements = (itemArray: UniqueKey[]) => {
    const result = new Array<KeyElement>()

    itemArray.forEach(item =>
      result.push({
        ...item,
        message: result.find(it => it.key === item.key) && unique ? t('keyMustUnique') : null,
      }),
    )

    return result
  }

  useEffect(
    () =>
      dispatch({
        type: 'merge-items',
        items,
      }),
    [items],
  )

  const onChange = async (index: number, key: string) => {
    let newItems = [...state]

    const item = {
      id: state[index].id,
      key,
    }

    newItems[index] = item

    newItems = newItems.filter(it => !isCompletelyEmpty(it))

    parentOnChange(newItems)
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyElement, index: number) => {
    const { id, key, message } = entry

    return (
      <div className="ml-2">
        <DyoInput
          key={`${id}-key`}
          disabled={disabled}
          containerClassName="p-1"
          grow
          placeholder={keyPlaceholder}
          value={key}
          message={message}
          onChange={e => onChange(index, e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className={clsx(className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!label ? null : (
        <DyoLabel className={clsx(labelClassName ?? 'text-bright mb-2 whitespace-nowrap')}>{label}</DyoLabel>
      )}
      {!description ? null : <div className="text-light-eased mb-2 ml-1">{description}</div>}

      {elements.map((it, index) => renderItem(it, index))}
    </div>
  )
}

export default KeyOnlyInput
