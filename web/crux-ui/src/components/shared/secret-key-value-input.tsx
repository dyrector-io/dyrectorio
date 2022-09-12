import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { UniqueKeySecretValue } from '@app/models-config'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { createMessage, encrypt, readKey } from 'openpgp'
import { useEffect, useReducer, useState } from 'react'
import { v4 as uuid } from 'uuid'

interface SecretKeyValueInputProps {
  disabled?: boolean
  className?: string
  heading?: string
  publicKey?: string
  items: UniqueKeySecretValue[]
  onSubmit: (items: UniqueKeySecretValue[]) => void
}

const EMPTY_SECRET_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeySecretValue

type KeyValueElement = UniqueKeySecretValue & {
  message?: string
}

const encryptWithPGP = async (text: string, key: string): Promise<string> => {
  if (!text) {
    return Promise.resolve('')
  }
  const publicKey = await readKey({ armoredKey: key })

  return (await encrypt({ message: await createMessage({ text }), encryptionKeys: publicKey })) as Promise<string>
}

type KeyValueInputActionType = 'merge-items' | 'set-items' | 'remove-item'

type KeyValueInputAction = {
  type: KeyValueInputActionType
  items: UniqueKeySecretValue[]
}

const isCompletelyEmpty = (it: UniqueKeySecretValue) => it.key.trim().length < 1 && it.value.trim().length < 1

const pushEmptyLineIfNecessary = (items: UniqueKeySecretValue[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_SECRET_KEY_VALUE_PAIR,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueKeySecretValue[], action: KeyValueInputAction): UniqueKeySecretValue[] => {
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
  if (type === 'remove-item') {
    const toRemove = action.items[0]
    const result = [...state.filter(old => old.id === toRemove.id)]
    pushEmptyLineIfNecessary(result)
    return result
  }

  throw Error(`Invalid KeyValueInput action: ${type}`)
}

const SecretKeyValInput = (props: SecretKeyValueInputProps) => {
  const { t } = useTranslation('common')

  const { heading, disabled, publicKey, items, className, onSubmit: propsOnSubmit } = props

  const [state, dispatch] = useReducer(reducer, items)
  const [changed, setChanged] = useState<boolean>(false)

  const stateToElements = (itemArray: UniqueKeySecretValue[]) => {
    const result = new Array<KeyValueElement>()

    itemArray.forEach(item =>
      result.push({
        ...item,
        encrypted: item.encrypted ?? false,
        message: result.find(it => it.key === item.key) ? t('keyMustUnique') : null,
      }),
    )

    return result as KeyValueElement[]
  }

  useEffect(() => {
    dispatch({
      type: 'merge-items',
      items,
    })
    setChanged(false)
  }, [items])

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
    setChanged(true)
  }

  const onDiscard = () => {
    dispatch({
      type: 'set-items',
      items,
    })
    setChanged(false)
  }

  const onSubmit = async () => {
    let newItems = [...state].filter(it => !isCompletelyEmpty(it))

    newItems = await Promise.all(
      [...newItems].map(
        async (it): Promise<UniqueKeySecretValue> => ({
          ...it,
          value: await encryptWithPGP(it.value, publicKey),
          encrypted: true,
        }),
      ),
    )

    propsOnSubmit(newItems)
    dispatch({
      type: 'set-items',
      items: newItems,
    })
    setChanged(false)
  }

  const onRemove = async (index: number) => {
    const newItems = [...state].filter(it => !isCompletelyEmpty(it))

    newItems.splice(index, 1)

    propsOnSubmit(newItems)
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { key, value, message, encrypted } = entry

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

        <div className="w-7/12 ml-2 flex">
          <DyoInput
            key={`${entry.id}-value`}
            disabled={disabled || encrypted}
            className="flex-auto"
            type={encrypted ? 'password' : 'text'}
            grow
            placeholder={t('value')}
            value={value}
            onChange={e => onChange(index, key, e.target.value)}
          />

          {encrypted && disabled !== true && (
            <div
              onClick={() => onRemove(index)}
              className="flex-initial cursor-pointer ml-2 h-11 w-11 ring-2 rounded-md focus:outline-none focus:dark text-bright-muted ring-light-grey-muted flex justify-center"
            >
              <Image
                className="text-bright-muted"
                src="/trash-can.svg"
                alt={t('common:clear')}
                width={24}
                height={24}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form className={clsx(className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!heading ? null : (
        <DyoHeading element="h6" className="text-bright mt-4 mb-2">
          {heading}
        </DyoHeading>
      )}
      {elements.map((it, index) => renderItem(it, index))}
      <div className="flex flex-row flex-grow p-1 justify-end">
        <DyoButton className="px-10 mr-1" disabled={!changed} secondary onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>
        <DyoButton className="px-10 ml-1" disabled={!changed} onClick={onSubmit}>
          {t('common:save')}
        </DyoButton>
      </div>
    </form>
  )
}

export default SecretKeyValInput
