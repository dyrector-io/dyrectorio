import assert from 'assert'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface DyoChipsProps<T> {
  className?: string
  key?: React.Key
  choices: readonly T[]
  isFilter?: boolean
  initialSelection?: T
  converter?: (choice: T) => string
  onSelectionChange: (choices: T) => void
}

const DyoChips = <T,>(props: DyoChipsProps<T>) => {
  const { choices, isFilter, converter, onSelectionChange, key: propsKey, className, initialSelection } = props

  assert(
    converter || choices.length < 1 || typeof choices[0] === 'string',
    'When choices are not string, you must define a converter.',
  )

  const { t } = useTranslation('common')

  const [selection, setSelection] = useState<T>(initialSelection ?? null)

  const onToggle = (item: T) => {
    setSelection(item)
    onSelectionChange(item)
  }

  const key = propsKey ?? 'dyo-chips'

  return (
    <div className={className}>
      {choices.map((it, index) => {
        const addAllChip = isFilter && it === null ? t('all') : undefined
        const text = addAllChip ?? (converter ? converter(it) : it)

        return (
          <button
            key={`${key}-${index}`}
            type="button"
            className={clsx(
              'rounded-md border-2 px-2 py-1 m-1',
              selection === it
                ? 'text-white font-medium border-dyo-turquoise bg-dyo-turquoise bg-opacity-30'
                : 'text-light-eased border-light-eased',
            )}
            onClick={() => onToggle(it)}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}

export default DyoChips
