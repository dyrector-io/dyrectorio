import clsx from 'clsx'
import Image from 'next/image'

export const SORT_MODES = ['alphabetical', 'date'] as const
export type TagSortMode = (typeof SORT_MODES)[number]

export type TagSortDirection = 'asc' | 'desc'

export type TagSortState = {
  mode: TagSortMode
  direction: TagSortDirection
}

type TagSortToggleProps = {
  className?: string
  state: TagSortState
  onStateChange: (state: TagSortState) => void
}

const iconOf = (mode: TagSortMode, direction: TagSortDirection) => `/sort-${mode}-${direction}.svg`

const TagSortToggle = (props: TagSortToggleProps) => {
  const { className, state, onStateChange } = props
  const { mode, direction } = state

  const onSortIconClick = (newMode: TagSortMode) => {
    if (mode !== newMode) {
      onStateChange({
        mode: newMode,
        direction,
      })
      return
    }

    onStateChange({
      mode,
      direction: direction === 'asc' ? 'desc' : 'asc',
    })
  }

  return (
    <div
      className={clsx(
        className,
        'px-1 bg-medium-eased text-white font-semibold rounded cursor-pointer h-10 flex flex-row',
      )}
    >
      {SORT_MODES.map(it => (
        <div
          key={it}
          className={clsx('px-2 py-1.5 my-1 mr-0.5', mode === it && 'bg-dyo-turquoise rounded')}
          onClick={() => onSortIconClick(it)}
        >
          <Image src={iconOf(it, direction)} alt={mode} width={22} height={22} />
        </div>
      ))}
    </div>
  )
}

export default TagSortToggle
