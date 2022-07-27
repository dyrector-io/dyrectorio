import assert from 'assert'
import clsx from 'clsx'
import { useState } from 'react'

interface DyoChipsProps<T> {
  className?: string
  key?: React.Key
  choices: readonly T[]
  initialSelection?: T
  converter?: (choice: T) => string
  onSelectionChange: (choices: T) => void
}

const DyoChips = <T,>(props: DyoChipsProps<T>) => {
  const { choices, converter, onSelectionChange } = props

  assert(
    converter || choices.length < 1 || typeof choices[0] === 'string',
    'When choices are not string, you must define an converter.',
  )

  const [selection, setSelection] = useState<T>(props.initialSelection ?? null)

  const onToggle = item => {
    setSelection(item)
    onSelectionChange(item)
  }

  const key = props.key ?? 'dyo-chips'

  return (
    <div className={props.className}>
      {choices.map((it, index) => {
        const text = converter ? converter(it) : it

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
