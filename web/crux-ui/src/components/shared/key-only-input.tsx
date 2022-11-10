import { DyoLabel } from '@app/elements/dyo-label'
import useRepatch from '@app/hooks/use-repatch'
import { UniqueKey } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { EditorStateOptions } from '../editor/use-editor-state'

const EMPTY_KEY = {
  id: uuid(),
  key: '',
} as UniqueKey

type KeyElement = UniqueKey & {
  message?: string
}

const isCompletelyEmpty = (it: UniqueKey): boolean => !it.key || it.key.length < 1

const generateEmptyLine = () => ({
  ...EMPTY_KEY,
  id: uuid(),
})

// actions
const setItems = (items: UniqueKey[]) => (): UniqueKey[] => items

const mergeItems =
  (updatedItems: UniqueKey[]) =>
  (state: UniqueKey[]): UniqueKey[] => {
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

interface KeyInputProps {
  disabled?: boolean
  className?: string
  label?: string
  labelClassName?: string
  description?: string
  items: UniqueKey[]
  keyPlaceholder?: string
  unique?: boolean
  editorOptions: EditorStateOptions
  onChange: (items: UniqueKey[]) => void
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
    editorOptions,
    unique,
    keyPlaceholder,
    onChange: propsOnChange,
  } = props

  const [state, dispatch] = useRepatch(items)

  const stateToElements = (itemArray: UniqueKey[]) => {
    const result: KeyElement[] = []

    itemArray.forEach(item =>
      result.push({
        ...item,
        message: result.find(it => it.key === item.key) && unique ? t('keyMustUnique') : null,
      }),
    )

    return result
  }

  useEffect(() => dispatch(mergeItems(items)), [items, dispatch])

  const onChange = async (index: number, key: string) => {
    const newItems = [...state]

    const item = {
      ...newItems[index],
      key,
    }

    newItems[index] = item

    const updatedItems = newItems.filter(it => !isCompletelyEmpty(it))

    propsOnChange(updatedItems)
    dispatch(setItems(newItems))
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyElement, index: number) => {
    const { id, key, message } = entry

    const keyId = `${id}-key`

    return (
      <div key={id} className="ml-2">
        <MultiInput
          key={keyId}
          id={keyId}
          disabled={disabled}
          editorOptions={editorOptions}
          containerClassName="p-1"
          grow
          placeholder={keyPlaceholder}
          value={key ?? ''}
          message={message}
          onPatch={it => onChange(index, it)}
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
