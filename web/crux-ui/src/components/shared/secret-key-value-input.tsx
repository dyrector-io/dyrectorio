import DyoButton from '@app/elements/dyo-button'
import DyoImgButton from '@app/elements/dyo-img-button'
import {
  ContainerConfigType,
  mapSecretKeyToSecretKeyValue,
  SecertOrigin,
  SecretInfo,
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
import SecretStatus from './secret-status'
import ConfigSectionLabel from '../container-configs/config-section-label'
import useRepatch from '@app/hooks/use-repatch'
import { MessageType } from '@app/elements/dyo-input'
import { Translate } from 'next-translate'

const EMPTY_SECRET_KEY_VALUE = {
  id: uuid(),
  key: '',
  value: '',
  required: false,
  encrypted: false,
  publicKey: null,
} as UniqueSecretKeyValue

type SecretElement = UniqueSecretKeyValue & {
  message?: string
  messageType?: MessageType
  defined: boolean
}

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
  const publicKey = await readKey({ armoredKey: key })

  return (await encrypt({ message: await createMessage({ text }), encryptionKeys: publicKey })) as Promise<string>
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

      result.push({
        ...item,
        encrypted: item.encrypted ?? false,
        message,
        messageType: duplicated ? 'error' : 'info',
        defined: info?.defined,
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
    dispatch(setItems(newItems))
  }

  const onResetSection = () => dispatch(resetItems(baseItems))

  const elements = stateToElements(state)

  const renderItem = (entry: SecretElement, index: number) => {
    const { id, key, value, encrypted, required, message, messageType, defined } = entry

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
            <div className="mr-2 flex flex-row basis-[32px] my-auto">
              {!isCompletelyEmpty(entry) && <SecretStatus className="mr-2" defined={defined} />}
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
              disabled={!encrypted || disabled}
              className="basis-12 flex-initial cursor-pointer w-12 focus:outline-none focus:dark text-bright-muted ring-light-grey-muted flex justify-center"
              src={required ? '/clear.svg' : '/trash-can.svg'}
              alt={t(required ? 'clear' : 'common:delete')}
              onClick={() => onRemoveOrClear(index)}
            />
          </div>
        </div>
      </div>
    )
  }

  const currentKeys = new Set(items.map(it => it.key))
  const hasMissingKeys = baseItems && baseItems.some(it => !currentKeys.has(it.key))

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
          <DyoButton className="px-10 ml-1" disabled={!changed || duplicates} onClick={onSubmit}>
            {t('save')}
          </DyoButton>
        </div>
      )}
    </form>
  )
}

export default SecretKeyValueInput
