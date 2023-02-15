import assert from 'assert'
import clsx from 'clsx'

export interface DyoChipsProps<T> {
  className?: string
  key?: React.Key
  disabled?: boolean
  choices: readonly T[]
  selection: T
  converter?: (choice: T) => string
  onSelectionChange: (choice: T) => void
}

const DyoChips = <T,>(props: DyoChipsProps<T>) => {
  const { choices, converter, onSelectionChange, key: propsKey, className, selection, disabled } = props

  assert(
    converter || choices.length < 1 || typeof choices[0] === 'string',
    'When choices are not string, you must define a converter.',
  )

  const key = propsKey ?? 'dyo-chips'
  return (
    <div className={className}>
      {choices.map((it, index) => {
        const text: string = converter ? converter(it) : (it as string)

        return (
          <button
            key={`${key}-${index}`}
            type="button"
            disabled={disabled}
            className={clsx(
              'rounded-md border-2 px-2 py-1 my-1 mr-2',
              selection === it
                ? 'text-white font-medium border-dyo-turquoise bg-dyo-turquoise bg-opacity-30'
                : 'text-light-eased border-light-eased',
              disabled ? 'cursor-not-allowed' : null,
            )}
            onClick={() => onSelectionChange(it)}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}

export default DyoChips
