import { DyoHeading } from '@app/elements/dyo-heading'
import useRepatch from '@app/hooks/use-repatch'
import { UniqueKey } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import MultiInput from '../editor/multi-input'
import { EditorStateOptions } from '../editor/use-editor-state'

const EMPTY_SECRET_KEY = {
  id: uuid(),
  key: '',
} as UniqueKey

type KeyValueElement = UniqueKey & {
  message?: string
}

const isCompletelyEmpty = (it: UniqueKey): boolean => !it.key || it.key.length < 1

const generateEmptyLine = () => ({
  ...EMPTY_SECRET_KEY,
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

interface SecretKeyInputProps {
  disabled?: boolean
  className?: string
  heading?: string
  items: UniqueKey[]
  editorOptions: EditorStateOptions
  onChange: (items: UniqueKey[]) => void
}

const SecretKeyOnlyInput = (props: SecretKeyInputProps) => {
  const { t } = useTranslation('common')

  const { heading, disabled, items, className, editorOptions, onChange: propsOnChange } = props

  const [state, dispatch] = useRepatch(items)

  const stateToElements = (itemArray: UniqueKey[]) => {
    const result: KeyValueElement[] = []

    itemArray.forEach(item =>
      result.push({
        ...item,
        message: result.find(it => it.key === item.key) ? t('keyMustUnique') : null,
      }),
    )

    return result
  }

  useEffect(() => dispatch(mergeItems(items)), [items, dispatch])

  const onChange = async (index: number, key: string) => {
    const newItems = [...state]

    const item = {
      id: state[index].id,
      key,
    }

    newItems[index] = item

    const updatedItems = newItems.filter(it => !isCompletelyEmpty(it))

    propsOnChange(updatedItems)
    dispatch(setItems(newItems))
  }

  const elements = stateToElements(state)

  const renderItem = (entry: KeyValueElement, index: number) => {
    const { id, key, message } = entry

    const keyId = `${entry.id}-key`

    return (
      <div key={id} className="flex flex-row flex-grow p-1">
        <div className="w-5/12">
          <MultiInput
            key={keyId}
            id={keyId}
            disabled={disabled}
            editorOptions={editorOptions}
            className="w-full mr-2"
            grow
            placeholder={t('key')}
            value={key}
            message={message}
            onPatch={it => onChange(index, it)}
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
