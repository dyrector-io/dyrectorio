import DyoButton from '@app/elements/dyo-button'
import DyoImgButton from '@app/elements/dyo-img-button'
import {
  ContainerConfigType,
  mapSecretKeyToSecretKeyValue,
  SecertOrigin,
  SecretInfo,
  SecretStatus,
  UniqueSecretKey,
  UniqueSecretKeyValue,
} from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { createMessage, encrypt, readKey } from 'openpgp'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { ItemEditorState } from '../editor/use-item-editor-state'
import SecretStatusIndicator from './secret-status-indicator'
import ConfigSectionLabel from '../container-configs/config-section-label'
import useRepatch from '@app/hooks/use-repatch'
import { MessageType } from '@app/elements/dyo-input'
import { Translate } from 'next-translate'

type SecretElement = UniqueSecretKeyValue & {
  message?: string
  messageType?: MessageType
  status: SecretStatus
}

const EMPTY_SECRET_KEY_VALUE = {
  id: uuid(),
  key: '',
  value: '',
  required: false,
  encrypted: false,
  publicKey: null,
} as UniqueSecretKeyValue

const secretOriginsToString = (t: Translate, origins: SecertOrigin[], configType: ContainerConfigType): string =>
  origins
    .filter(it => it.type !== configType)
    .map(it => {
      const type = t(`container:configType.${it.type}`)
      if (!it.name) {
        return type
      }

      return `${type}: ${it.name}`
    })
    .join(', ')

const isCompletelyEmpty = (it: UniqueSecretKeyValue): boolean => !it.key?.trim() && !it.value?.trim()

const generateEmptyLine = () => ({
  ...EMPTY_SECRET_KEY_VALUE,
  id: uuid(),
})

const encryptWithPGP = async (text: string, key: string): Promise<string> => {
  if (!text) {
    return Promise.resolve('')
  }

  if (!key) {
    return null
  }

  const publicKey = await readKey({ armoredKey: key })
  const message = await createMessage({ text })
  const encrypted = await encrypt({ message, encryptionKeys: publicKey })

  return encrypted as Promise<string>
}

// actions
const setItems = (items: UniqueSecretKeyValue[]) => (): UniqueSecretKeyValue[] => {
  const lastLine = items.length > 0 ? items[items.length - 1] : null
  const emptyLine = lastLine && isCompletelyEmpty(lastLine) ? lastLine : generateEmptyLine()

  return [...items.filter(it => !isCompletelyEmpty(it)), emptyLine]
}

const mergeItems =
  (updatedItems: UniqueSecretKeyValue[]) =>
  (state: UniqueSecretKeyValue[]): UniqueSecretKeyValue[] => {
    if (!updatedItems) {
      updatedItems = []
    }

    const lastLine = state.length > 0 ? state[state.length - 1] : null
    const emptyLine = lastLine && isCompletelyEmpty(lastLine) ? lastLine : generateEmptyLine()

    const result = [...state.filter(old => !isCompletelyEmpty(old) && updatedItems.find(it => old.id === it.id))]

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

const resetItems =
  (items: UniqueSecretKey[]) =>
  (state: UniqueSecretKeyValue[]): UniqueSecretKeyValue[] => {
    if (!items) {
      return state
    }

    const overriden = state.filter(it => it.value)
    const overridenKeys = new Set(overriden.map(it => it.key))
    const missing = items.filter(it => !overridenKeys.has(it.key)).map(it => mapSecretKeyToSecretKeyValue(it))

    return [...overriden, ...missing, generateEmptyLine()]
  }

const removeItem =
  (index: number) =>
  (state: UniqueSecretKeyValue[]): UniqueSecretKeyValue[] => {
    if (index < 0 || index >= state.length) {
      return state
    }

    const item = state[index]
    if (isCompletelyEmpty(item)) {
      return state
    }

    const newItems = [...state]
    newItems.splice(index, 1)
    return newItems
  }

const clearItem =
  (index: number) =>
  (state: UniqueSecretKeyValue[]): UniqueSecretKeyValue[] => {
    if (index < 0 || index >= state.length) {
      return state
    }

    const item = state[index]
    if (isCompletelyEmpty(item)) {
      return state
    }

    item.value = ''
    item.encrypted = false
    item.publicKey = null

    return [...state]
  }

type SecretKeyValueInputProps = {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueSecretKeyValue[]
  baseItems: UniqueSecretKey[]
  keyPlaceholder?: string
  editorOptions: ItemEditorState
  publicKey: string
  configType: ContainerConfigType
  secretInfos: Map<string, SecretInfo>
  onSubmit: (items: UniqueSecretKeyValue[]) => void
}

const SecretKeyValueInput = (props: SecretKeyValueInputProps) => {
  const {
    disabled,
    className,
    label,
    labelClassName,
    description,
    items,
    baseItems,
    keyPlaceholder,
    editorOptions,
    publicKey,
    configType,
    secretInfos,
    onSubmit: propsOnSubmit,
  } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useRepatch(items ?? [])
  const [changed, setChanged] = useState<boolean>(false)

  const stateToElements = (secretKeys: UniqueSecretKeyValue[]) => {
    const result = new Array<SecretElement>()

    secretKeys.forEach(item => {
      const info = secretInfos.get(item.key)
      const duplicated = !isCompletelyEmpty(item) && result.find(it => it.key === item.key)

      let message: string = duplicated ? t('keyMustUnique') : null
      if (info && !message) {
        message = secretOriginsToString(t, info.origins, configType)
      }

      const saved = items.find(it => it.key === item.key && it.value === item.value)
      const encrypted = item.encrypted ?? false

      result.push({
        ...item,
        encrypted,
        message,
        messageType: duplicated ? 'error' : 'info',
        status: info?.defined ? 'defined' : encrypted ? 'encrypted' : saved ? 'saved' : 'unknown',
      })
    })

    return result as SecretElement[]
  }

  useEffect(() => {
    dispatch(mergeItems(items))
    setChanged(false)
  }, [items, dispatch])

  const duplicates = useMemo(() => {
    const keys = state.map(it => it.key)

    return keys.some((item, index) => keys.indexOf(item) !== index)
  }, [state])

  const onChange = async (index: number, patch: Partial<UniqueSecretKeyValue>) => {
    const newItems = [...state]

    const item = {
      ...newItems[index],
      ...patch,
    }

    newItems[index] = item

    dispatch(setItems(newItems))
    setChanged(true)
  }

  const onDiscard = () => {
    dispatch(setItems(items))
    setChanged(false)
  }

  const onSubmit = async () => {
    if (duplicates) {
      return
    }

    let newItems = [...state].filter(it => !isCompletelyEmpty(it))

    newItems = await Promise.all(
      [...newItems].map(async (it): Promise<UniqueSecretKeyValue> => {
        let { value } = it
        let encryptedWithPublicKey = it.publicKey

        if (!it.encrypted) {
          if (!publicKey) {
            return {
              ...it,
              encrypted: false,
              publicKey: null,
            }
          }

          value = await encryptWithPGP(it.value, publicKey)
          encryptedWithPublicKey = publicKey
        }

        return {
          ...it,
          value,
          encrypted: true,
          publicKey: encryptedWithPublicKey,
        }
      }),
    )

    propsOnSubmit(newItems)
    dispatch(setItems(newItems))
    setChanged(false)
  }

  const onRemove = async (index: number) => {
    dispatch(removeItem(index))
    setChanged(true)
  }

  const onClear = async (index: number) => {
    dispatch(clearItem(index))
    setChanged(true)
  }

  const onResetSection = () => dispatch(resetItems(baseItems))

  const elements = stateToElements(state)

  const renderItem = (entry: SecretElement, index: number) => {
    const { id, key, value, encrypted, required, message, messageType, status } = entry

    const keyId = `${id}-key`
    const valueId = `${id}-value`

    const empty = isCompletelyEmpty(entry)

    return (
      <div key={id} className="flex-1 p-1 flex flex-row">
        <div className="basis-5/12 relative">
          {required && (
            <div className="absolute right-0 h-full flex mr-2">
              <Image src="/asterisk.svg" alt={t('required')} width={12} height={12} />
            </div>
          )}
          <div className="flex flex-row">
            <div className="mr-2 flex flex-row basis-[32px] my-auto">
              {!isCompletelyEmpty(entry) && <SecretStatusIndicator className="mr-2" status={status} />}
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
              messageType={messageType}
              editorOptions={editorOptions}
              onPatch={it =>
                onChange(index, {
                  key: it,
                  value,
                })
              }
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
            onPatch={it =>
              onChange(index, {
                key,
                value: it,
              })
            }
          />

          <div className="ml-2 flex flex-row basis-[64px] my-auto">
            <DyoImgButton
              disabled={disabled || empty || (!encrypted && !value)}
              className="basis-12 flex-initial cursor-pointer w-12 focus:outline-none focus:dark text-bright-muted ring-light-grey-muted flex justify-center"
              src="/clear.svg"
              alt={t('clear')}
              onClick={() => onClear(index)}
            />
            <DyoImgButton
              disabled={disabled || empty || required}
              className="basis-12 flex-initial cursor-pointer w-12 focus:outline-none focus:dark text-bright-muted ring-light-grey-muted flex justify-center"
              src="/trash-can.svg"
              alt={t('common:delete')}
              onClick={() => onRemove(index)}
            />
          </div>
        </div>
      </div>
    )
  }

  const currentKeys = new Set(items.map(it => it.key))
  const hasMissingKeys = baseItems && baseItems.some(it => !currentKeys.has(it.key))
  const canEncryptSome = publicKey && items.some(it => !it.encrypted && it.value)

  return (
    <form className={clsx(className, 'flex flex-col gap-2')}>
      <ConfigSectionLabel
        disabled={disabled || !hasMissingKeys}
        onResetSection={hasMissingKeys ? onResetSection : null}
        labelClassName={labelClassName}
      >
        {label}
      </ConfigSectionLabel>

      {!description ? null : <div className="text-light-eased ml-1">{description}</div>}

      {elements.map((it, index) => renderItem(it, index))}

      {!disabled && (
        <div className="flex flex-row flex-grow p-1 mr-14 justify-end">
          <DyoButton className="px-10 mr-1" disabled={!changed} secondary onClick={onDiscard}>
            {t('discard')}
          </DyoButton>
          <DyoButton className="px-10 ml-1" disabled={(!changed && !canEncryptSome) || duplicates} onClick={onSubmit}>
            {t('save')}
          </DyoButton>
        </div>
      )}
    </form>
  )
}

export default SecretKeyValueInput
