import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import useRepatch from '@app/hooks/use-repatch'
import { UniqueSecretKey } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { EditorStateOptions } from '../editor/use-editor-state'

const EMPTY_KEY = {
  id: uuid(),
  key: '',
  required: false,
} as UniqueSecretKey

type SecretElement = UniqueSecretKey & {
  message?: string
}

const isCompletelyEmpty = (it: UniqueSecretKey): boolean => !it.key || it.key.length < 1

const generateEmptyLine = () => ({
  ...EMPTY_KEY,
  id: uuid(),
})

// actions
const setItems = (items: UniqueSecretKey[]) => (): UniqueSecretKey[] => items

const mergeItems =
  (updatedItems: UniqueSecretKey[]) =>
  (state: UniqueSecretKey[]): UniqueSecretKey[] => {
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

interface SecretKeyInputProps {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueSecretKey[]
  keyPlaceholder?: string
  unique?: boolean
  editorOptions: EditorStateOptions
  onChange: (items: UniqueSecretKey[]) => void
}

const SecretKeyInput = (props: SecretKeyInputProps) => {
  const { t } = useTranslation('common')

  const {
    label,
    labelClassName,
    description,
    disabled,
    items,
    className,
    editorOptions,
    unique,
    keyPlaceholder,
    onChange: propsOnChange,
  } = props

  const [state, dispatch] = useRepatch(items)

  const stateToElements = (itemArray: UniqueSecretKey[]) => {
    const result: SecretElement[] = []

    itemArray.forEach(item => {
      const repeating = unique && result.find(it => it.key === item.key)

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

    if (keys.every((it, itIndex) => keys.indexOf(it) === itIndex)) {
      propsOnChange(updatedItems)
    }
    dispatch(setItems(newItems))
  }

  const elements = stateToElements(state)

  const renderItem = (entry: SecretElement, index: number) => {
    const { id, key, message, required } = entry

    const keyId = `${id}-key`

    return (
      <div key={keyId} className="flex flex-row flex-grow mb-2 ml-1">
        <div className="basis-5/12">
          <MultiInput
            key={keyId}
            id={keyId}
            disabled={disabled}
            editorOptions={editorOptions}
            grow
            inline
            placeholder={keyPlaceholder}
            value={key ?? ''}
            message={message}
            onPatch={it => onChange(index, { key: it })}
          />
        </div>
        <div className="basis-7/12 flex items-center justify-end">
          {!isCompletelyEmpty(entry) && (
            <div className="flex-0">
              <DyoToggle
                id="required"
                nameChecked={t('required')}
                nameUnchecked={t('notRequired')}
                checked={required}
                onCheckedChange={it => onChange(index, { required: it })}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(className, 'flex flex-col max-h-128 overflow-y-auto')}>
      {!label ? null : (
        <DyoLabel className={clsx(labelClassName ?? 'text-bright mb-2 whitespace-nowrap text-light-eased')}>
          {label}
        </DyoLabel>
      )}

      {!description ? null : <div className="text-light-eased mb-2 ml-1">{description}</div>}

      {elements.map((it, index) => renderItem(it, index))}
    </div>
  )
}

export default SecretKeyInput
