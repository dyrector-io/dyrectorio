import { DyoHeading } from '@app/elements/dyo-heading'
import { MessageType } from '@app/elements/dyo-input'
import useRepatch from '@app/hooks/use-repatch'
import { UniqueKeyValue } from '@app/models'
import { getValidationError } from '@app/validations'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import BaseSchema from 'yup/lib/schema'
import EditorInput from '../editor/editor-input'
import { EditorOptions } from '../editor/use-editor-state'

const EMPTY_KEY_VALUE_PAIR = {
  id: uuid(),
  key: '',
  value: '',
} as UniqueKeyValue

type KeyValueElement = UniqueKeyValue & {
  message?: string
  messageType: MessageType
}

const isCompletelyEmpty = (it: UniqueKeyValue) => it.key.trim().length < 1 && it.value.trim().length < 1

const generateEmptyLine = () => ({
  ...EMPTY_KEY_VALUE_PAIR,
  id: uuid(),
})

const setItems = (items: UniqueKeyValue[]) => (): UniqueKeyValue[] => items

const mergeItems =
  (updatedItems: UniqueKeyValue[]) =>
  (state: UniqueKeyValue[]): UniqueKeyValue[] => {
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

interface KeyValueInputProps {
  disabled?: boolean
  valueDisabled?: boolean
  className?: string
  heading?: string
  items: UniqueKeyValue[]
  editorOptions: EditorOptions
  onChange: (items: UniqueKeyValue[]) => void
  hint?: { hintValidation: BaseSchema; hintText: string }
}

const KeyValueInput = (props: KeyValueInputProps) => {
  const { heading, disabled, className, items, valueDisabled, hint, editorOptions, onChange: propsOnChange } = props

  const { t } = useTranslation('common')

  const [state, dispatch] = useRepatch(items)

  const stateToElements = (keyValues: UniqueKeyValue[]) => {
    const result = []

    keyValues.forEach(item => {
      const keyUniqueErr = result.find(it => it.key === item.key) ? t('keyMustUnique') : null
      const hintErr = !keyUniqueErr && hint ? getValidationError(hint.hintValidation, item.key) : null
      result.push({
        ...item,
        message: keyUniqueErr ?? (hintErr ? hint.hintText : null),
        messageType: (keyUniqueErr ? 'error' : 'info') as MessageType,
      })
    })

    return result as KeyValueElement[]
  }

  useEffect(() => dispatch(mergeItems(items)), [items, dispatch])

  const onChange = (index: number, key: string, value: string) => {
    const newItems = [...state]

    const item = {
      id: state[index].id,
      key,
      value,
    }

    newItems[index] = item

    const updatedItems = newItems.filter(it => !isCompletelyEmpty(it))

    propsOnChange(updatedItems)
    dispatch(setItems(newItems))
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { key, value, message, messageType } = entry

    const keyId = `${entry.id}-key`
    const valueId = `${entry.id}-value`

    return (
      <div key={entry.id} className="flex flex-row flex-grow p-1">
        <div className="w-5/12">
          <EditorInput
            key={keyId}
            id={keyId}
            disabled={disabled}
            options={editorOptions}
            className="w-full mr-2"
            grow
            placeholder={t('key')}
            value={key}
            message={message}
            messageType={messageType}
            onPatch={it => onChange(index, it, value)}
          />
        </div>

        <div className="w-7/12 ml-2">
          <EditorInput
            key={valueId}
            id={valueId}
            disabled={disabled || valueDisabled}
            options={editorOptions}
            className="w-full"
            grow
            placeholder={t('value')}
            value={value}
            onPatch={it => onChange(index, key, it)}
          />
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
    </form>
  )
}

export default KeyValueInput
