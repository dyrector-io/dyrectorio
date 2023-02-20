import DyoButton from '@app/elements/dyo-button'
import { DyoLabel } from '@app/elements/dyo-label'
import { UniqueSecretKeyValue } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { createMessage, encrypt, readKey } from 'openpgp'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { ItemEditorState } from '../editor/use-item-editor-state'
import SecretStatus from './secret-status'

const EMPTY_SECRET_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueSecretKeyValue

type KeyValueElement = UniqueSecretKeyValue & {
  message?: string
  present?: boolean
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
  items: UniqueSecretKeyValue[]
}

const isCompletelyEmpty = (it: UniqueSecretKeyValue) => it.key.trim().length < 1 && it.value.trim().length < 1

const pushEmptyLineIfNecessary = (items: UniqueSecretKeyValue[]) => {
  if (items.length < 1 || (items[items.length - 1].key?.trim() ?? '') !== '') {
    items.push({
      ...EMPTY_SECRET_KEY_VALUE_PAIR,
      id: uuid(),
    })
  }
}

const reducer = (state: UniqueSecretKeyValue[], action: KeyValueInputAction): UniqueSecretKeyValue[] => {
  const { type } = action

  if (type === 'set-items') {
    const result = action.items ? [...action.items] : []
    pushEmptyLineIfNecessary(result)
    return result
  }
  if (type === 'merge-items') {
    const updatedItems = action.items ?? []
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

interface SecretKeyValueInputProps {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueSecretKeyValue[]
  keyPlaceholder?: string
  editorOptions: ItemEditorState
  publicKey: string
  definedSecrets?: string[]
  onSubmit: (items: UniqueSecretKeyValue[]) => void
}

const SecretKeyValueInput = (props: SecretKeyValueInputProps) => {
  const { t } = useTranslation('common')

  const {
    disabled,
    className,
    label,
    labelClassName,
    description,
    items,
    keyPlaceholder,
    editorOptions,
    publicKey,
    definedSecrets,
    onSubmit: propsOnSubmit,
  } = props

  const [state, dispatch] = useReducer(reducer, items ?? [])
  const [changed, setChanged] = useState<boolean>(false)

  const stateToElements = (secretKeys: UniqueSecretKeyValue[], secrets: string[]) => {
    const result = new Array<KeyValueElement>()

    secretKeys.forEach(item => {
      const repeating = result.find(it => it.key === item.key)

      result.push({
        ...item,
        encrypted: item.encrypted ?? false,
        message: repeating && !isCompletelyEmpty(item) ? t('keyMustUnique') : null,
        present: isCompletelyEmpty(item) || secrets === undefined ? undefined : secrets.includes(item.key),
      })
    })

    return result as KeyValueElement[]
  }

  useEffect(() => {
    dispatch({
      type: 'merge-items',
      items,
    })
    setChanged(false)
  }, [items])

  const duplicates = useMemo(() => {
    const keys = state.map(it => it.key)

    return keys.some((item, index) => keys.indexOf(item) !== index)
  }, [state])

  const onChange = async (index: number, key: string, value: string) => {
    let newItems = [...state]

    const item = {
      ...newItems[index],
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
    if (duplicates) {
      return
    }

    let newItems = [...state].filter(it => !isCompletelyEmpty(it))

    newItems = await Promise.all(
      [...newItems].map(
        async (it): Promise<UniqueSecretKeyValue> => ({
          ...it,
          value: await encryptWithPGP(it.value, publicKey),
          encrypted: true,
          publicKey,
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

  const onRemoveOrClear = async (index: number) => {
    const newItems = [...state].filter(it => !isCompletelyEmpty(it))

    if (newItems[index].required) {
      newItems[index] = {
        ...newItems[index],
        encrypted: false,
        value: '',
      }
    } else {
      newItems.splice(index, 1)
    }

    if (!duplicates) {
      propsOnSubmit(newItems)
    }
    dispatch({
      type: 'set-items',
      items: newItems,
    })
  }

  const elements = stateToElements(state, definedSecrets)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { id, key, value, message, encrypted, required } = entry

    const keyId = `${id}-key`
    const valueId = `${id}-value`

    return (
      <div key={id} className="flex-1 p-1 flex flex-row">
        <div className="basis-5/12 relative">
          {required && (
            <div className="absolute right-0 h-full flex mr-2">
              <Image src="/asterisk.svg" alt={t('required')} width={12} height={12} />
            </div>
          )}
          <div className="flex flex-row">
            <div className="mr-2 flex flex-row basis-[16px] my-auto">
              {!isCompletelyEmpty(entry) && <SecretStatus className="mr-2" present={entry.present} />}
            </div>
            <MultiInput
              key={keyId}
              id={keyId}
              containerClassName="basis-full"
              disabled={disabled || required}
              grow
              placeholder={t('key') ?? keyPlaceholder}
              value={key}
              message={message}
              editorOptions={editorOptions}
              onPatch={it => onChange(index, it, value)}
            />
          </div>
        </div>
        <div className="basis-7/12 flex flex-row pl-2">
          <MultiInput
            key={valueId}
            id={valueId}
            disabled={disabled || encrypted}
            containerClassName="basis-full"
            type={encrypted ? 'password' : 'text'}
            grow
            placeholder={t('value')}
            value={value}
            editorOptions={editorOptions}
            onPatch={it => onChange(index, key, it)}
          />
          {encrypted && disabled !== true && (
            <div
              onClick={() => onRemoveOrClear(index)}
              className="basis-12 flex-initial cursor-pointer ml-2 w-12 ring-2 rounded-md focus:outline-none focus:dark text-bright-muted ring-light-grey-muted flex justify-center"
            >
              <Image
                className="text-bright-muted"
                src={required ? '/clear.svg' : '/trash-can.svg'}
                alt={t('clear')}
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
    <form className={clsx(className, 'flex flex-col')}>
      {!label ? null : (
        <DyoLabel className={clsx(labelClassName ?? 'mb-2 whitespace-nowrap text-light-eased')}>{label}</DyoLabel>
      )}

      {!description ? null : <div className="text-light-eased mb-2 ml-1">{description}</div>}

      {elements.map((it, index) => renderItem(it, index))}

      {!disabled && (
        <div className="flex flex-row flex-grow p-1 justify-end">
          <DyoButton className="px-10 mr-1" disabled={!changed} secondary onClick={onDiscard}>
            {t('discard')}
          </DyoButton>
          <DyoButton className="px-10 ml-1" disabled={!changed || duplicates} onClick={onSubmit}>
            {t('save')}
          </DyoButton>
        </div>
      )}
    </form>
  )
}

export default SecretKeyValueInput
