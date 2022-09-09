import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { UniqueKey } from '@app/models-config'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

interface SecretKeyInputProps {
  disabled?: boolean
  className?: string
  heading?: string
  items: UniqueKey[]
  onSubmit: (items: UniqueKey[]) => void
}

const EMPTY_SECRET_KEY = {
  id: uuid(),
  key: '',
} as UniqueKey

type KeyValueElement = UniqueKey & {
  message?: string
}

type KeyValueInputActionType = 'merge-items' | 'set-items'

type KeyValueInputAction = {
  type: KeyValueInputActionType
  items: UniqueKey[]
}

const isCompletelyEmpty = (it: UniqueKey): boolean => !it.key || it.key.length < 1

const pushEmptyLineIfNecessary = (items: UniqueKey[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_SECRET_KEY,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKey[], action: KeyValueInputAction): UniqueKey[] => {
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

const SecretKeyOnlyInput = (props: SecretKeyInputProps) => {
  const { t } = useTranslation('common')

  const { heading, disabled, items, className, onSubmit } = props

  const [state, dispatch] = useReducer(reducer, items)

  const stateToElements = (itemArray: UniqueKey[]) => {
    const result = new Array<KeyValueElement>()

    itemArray.forEach(item =>
      result.push({
        ...item,
        message: result.find(it => it.key === item.key) ? t('keyMustUnique') : null,
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

    onSubmit(newItems)
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { id, key, message } = entry

    return (
      <div key={id} className="flex flex-row flex-grow p-1">
        <div className="w-5/12">
          <DyoInput
            key={`${id}-key`}
            disabled={disabled}
            className="w-full mr-2"
            grow
            placeholder={t('key')}
            value={key}
            message={message}
            onChange={e => onChange(index, e.target.value)}
          />
        </div>
      </div>
    )
  }

  return (
    <form className={clsx(className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!heading ? null : (
        <DyoHeading element="h6" className="text-bright mt-5">
          {heading}
        </DyoHeading>
      )}
      <div className="text-light-eased mb-2 ml-1">{t('cannotDefineSecretsHere')}</div>
      {elements.map((it, index) => renderItem(it, index))}
    </form>
  )
}

export default SecretKeyOnlyInput
