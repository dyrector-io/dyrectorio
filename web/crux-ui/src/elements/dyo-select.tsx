import clsx from 'clsx'

type DyoSelectProps = {
  className?: string
  options: string[]
  selected: number
  onChange: (index: number) => void
}

const DyoSelect = (props: DyoSelectProps) => {
  const { className, options, selected, onChange } = props

  return (
    <select
      className={clsx(
        'bg-transparent h-8 ring-2 ring-light-grey rounded-md !text-white focus:outline-none pl-2',
        className,
      )}
      onChange={e => {
        const { value } = e.target

        onChange(Number.parseInt(value, 10))
      }}
      value={selected}
    >
      {options.map((it, index) => (
        <option key={it} value={index} className="bg-medium">
          {it}
        </option>
      ))}
    </select>
  )
}

export default DyoSelect
