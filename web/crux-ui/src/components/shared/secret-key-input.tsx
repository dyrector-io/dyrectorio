import DyoToggle from '@app/elements/dyo-toggle'
import useRepatch from '@app/hooks/use-repatch'
import { UniqueSecretKey } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { ItemEditorState } from '../editor/use-item-editor-state'
import ConfigSectionLabel from '../container-configs/config-section-label'

const EMPTY_KEY = {
  id: uuid(),
  key: '',
  required: false,
} as UniqueSecretKey

type SecretElement = UniqueSecretKey & {
  message?: string
}

const isCompletelyEmpty = (it: UniqueSecretKey): boolean => !it.key?.trim()

const generateEmptyLine = () => ({
  ...EMPTY_KEY,
  id: uuid(),
})

// actions
const setItems = (items: UniqueSecretKey[]) => (): UniqueSecretKey[] => items

const mergeItems =
  (updatedItems: UniqueSecretKey[]) =>
  (state: UniqueSecretKey[]): UniqueSecretKey[] => {
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

type SecretKeyInputProps = {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueSecretKey[]
  keyPlaceholder?: string
  editorOptions: ItemEditorState
  onChange: (items: UniqueSecretKey[]) => void
  onResetSection?: VoidFunction
}

const SecretKeyInput = (props: SecretKeyInputProps) => {
  const {
    label,
    labelClassName,
    description,
    disabled,
    items,
    className,
    editorOptions,
    keyPlaceholder,
    onChange: propsOnChange,
    onResetSection: propsOnResetSection,
  } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useRepatch(items ?? [])

  const stateToElements = (secrets: UniqueSecretKey[]) => {
    const result: SecretElement[] = []

    secrets.forEach(item => {
      const repeating = result.find(it => it.key === item.key)

      result.push({
        ...item,
        required: item.required ?? false,
        message: repeating && !isCompletelyEmpty(item) ? t('keyMustUnique') : null,
      })
    })

    return result
  }

  useEffect(() => dispatch(mergeItems(items)), [items, dispatch])

  const onChange = async (index: number, patch: Partial<UniqueSecretKey>) => {
    const newItems = [...state]

    const item = {
      ...newItems[index],
      ...patch,
    }

    newItems[index] = item

    const updatedItems = newItems.filter(it => !isCompletelyEmpty(it))
    const keys = updatedItems.map(it => it.key)

    if (keys.every((key, keyIndex) => keys.indexOf(key) === keyIndex)) {
      propsOnChange(updatedItems)
    }
    dispatch(setItems(newItems))
  }

  const onResetSection = () => {
    dispatch(mergeItems([]))

    propsOnResetSection()
  }

  const elements = stateToElements(state)

  const renderItem = (entry: SecretElement, index: number) => {
    const { id, key, message, required } = entry

    const keyId = `${id}-key`

    return (
      <div key={keyId} className="flex flex-row justify-items-stretch gap-4 ml-1">
        <MultiInput
          key={keyId}
          id={keyId}
          disabled={disabled}
          editorOptions={editorOptions}
          containerClassName="w-full"
          grow
          placeholder={keyPlaceholder}
          value={key ?? ''}
          message={message}
          onPatch={it => onChange(index, { key: it })}
        />
        {!isCompletelyEmpty(entry) && (
          <div className="my-auto">
            <DyoToggle
              id="required"
              label={t('required')}
              checked={required}
              disabled={disabled}
              onCheckedChange={it => onChange(index, { required: it })}
            />
          </div>
        )}
      </div>
    )
  }

  const hasValue = items && items.length > 0

  return (
    <div className={clsx(className, 'flex flex-col gap-4')}>
      {!label ? null : (
        <ConfigSectionLabel
          disabled={disabled || !propsOnResetSection || !hasValue}
          onResetSection={onResetSection}
          labelClassName={labelClassName}
        >
          {label}
        </ConfigSectionLabel>
      )}

      {!description ? null : <div className="text-light-eased ml-1">{description}</div>}

      {elements.map((it, index) => renderItem(it, index))}
    </div>
  )
}

export default SecretKeyInput
