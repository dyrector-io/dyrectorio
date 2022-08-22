import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { UniqueKeySecretValue } from '@app/models-config'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { createMessage, encrypt, readKey } from 'openpgp'
import { useEffect, useReducer } from 'react'
import { v4 as uuid } from 'uuid'

interface SecretKeyValueInputProps {
  disabled?: boolean
  valueDisabled?: boolean
  className?: string
  heading?: string
  publicKey: string
  items: UniqueKeySecretValue[]
  onSubmit: (items: UniqueKeySecretValue[]) => void
}

const EMPTY_SECRET_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeySecretValue

const SecretKeyValInput = (props: SecretKeyValueInputProps) => {
  const { t } = useTranslation('common')

  const { heading, disabled, valueDisabled } = props

  const [state, dispatch] = useReducer(reducer, props.items)

  const stateToElements = (items: UniqueKeySecretValue[]) => {
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

  const onChange = async (index: number, key: string, value: string) => {
    let newItems = [...state]

    const item = {
      id: state[index].id,
      key,
      value,
    }

    newItems[index] = item

    newItems = newItems.filter(it => !isCompletelyEmpty(it))
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }
  const onSubmit = async () => {
    let newItems = await Promise.all(
      [...state].map(async (it): Promise<UniqueKeySecretValue> => {
        return { ...it, value: await encryptWithPGP(it.value, props.publicKey) }
      }),
    )
    newItems = newItems.filter(it => !isCompletelyEmpty(it))

    props.onSubmit(newItems)
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
        <div className="w-4/12">
          <DyoInput
            key={`${entry.id}-key`}
            disabled={disabled}
            className="w-full mr-2"
            grow
            placeholder={t('key')}
            value={key}
            message={message}
            onChange={e => onChange(index, e.target.value, value)}
            // onBlur={e => onBlur(index, e.target.value, value)}
          />
        </div>

        <div className="w-6/12 ml-2">
          <DyoInput
            key={`${entry.id}-value`}
            disabled={disabled || valueDisabled}
            className="w-full"
            grow
            placeholder={t('value')}
            value={value}
            onChange={e => onChange(index, key, e.target.value)}
            // onBlur={e => onBlur(index, key, e.target.value)}
          />
        </div>

        <div className="w-1/12 ml-1 text-white">
          <button onClick={onSubmit} type="button">
            Send
          </button>
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

export default SecretKeyValInput

type KeyValueElement = UniqueKeySecretValue & {
  message?: string
}

const encryptWithPGP = async (text: string, key: string): Promise<string> => {
  if (!text) {
    return Promise.resolve('')
  }
  const publicKey = await readKey({ armoredKey: key })
  const textStream = await encrypt({ message: await createMessage({ text }), encryptionKeys: publicKey })

  console.log(textStream)

  const str = textStream as string
  console.log(str)

  return (await encrypt({ message: await createMessage({ text }), encryptionKeys: publicKey })) as Promise<string>
}

type KeyValueInputActionType = 'merge-items' | 'set-items'

type KeyValueInputAction = {
  type: KeyValueInputActionType
  items: UniqueKeySecretValue[]
}

const isCompletelyEmpty = (it: UniqueKeySecretValue) => {
  return it.key.trim().length < 1 && it.value.trim().length < 1
}

const pushEmptyLineIfNecessary = (items: UniqueKeySecretValue[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_SECRET_KEY_VALUE_PAIR,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKeySecretValue[], action: KeyValueInputAction): UniqueKeySecretValue[] => {
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
