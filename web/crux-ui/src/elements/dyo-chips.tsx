import assert from 'assert'
import clsx from 'clsx'
import { useState } from 'react'

interface DyoChipsProps<T> {
  key?: React.Key
  multiple?: boolean
  choices: readonly T[]
  initialSelection?: T[]
  converter?: (choice: T) => string
  onChoicesChange: (choices: T[]) => void
}

const DyoChips = <T,>(props: DyoChipsProps<T>) => {
  const { multiple, choices, converter, onChoicesChange } = props

  assert(
    converter || choices.length < 1 || typeof choices[0] === 'string',
    'When choices are not string, you must define an converter.',
  )

  const [selection, setSelection] = useState<T[]>(props.initialSelection ?? [])

  const onToggle = item => {
    if (!multiple) {
      const newSelection = [item]
      setSelection(newSelection)
      onChoicesChange(newSelection)
      return
    }

    const selected = selection.includes(item)
    let newSelection = !selected ? [...selection, item] : selection.filter(it => it != item)

    setSelection(newSelection)
    onChoicesChange(newSelection)
  }

  const key = props.key ?? 'dyo-chips'

  return (
    <>
      {choices.map((it, index) => {
        const selected = selection.includes(it)

        const text = converter ? converter(it) : it
        return (
          <button
            key={`${key}-${index}`}
            type="button"
            className={clsx(
              'rounded-md border-2 px-2 py-1 m-1',
              selected
                ? 'text-white font-medium border-dyo-turquoise bg-dyo-turquoise bg-opacity-30'
                : 'text-light-eased border-light-eased',
            )}
            onClick={() => onToggle(it)}
          >
            {text}
          </button>
        )
      })}
    </>
  )
}

export default DyoChips
