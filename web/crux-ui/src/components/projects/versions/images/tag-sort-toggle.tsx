import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

export const SORT_MODES = ['alphabetic', 'date'] as const
export type SortModesEnum = (typeof SORT_MODES)[number]

export type SortState = {
  mode: SortModesEnum
  dir: -1 | 1
}

type TagSortToggleProps = {
  className?: string
  state: SortState
  onStateChange: (state: SortState) => void
}

const SORT_ICONS: Record<SortModesEnum, { '1': string; '-1': string }> = {
  alphabetic: {
    '1': '/sort-alphabetical-asc.svg',
    '-1': '/sort-alphabetical-desc.svg',
  },
  date: {
    '1': '/sort-date-asc.svg',
    '-1': '/sort-date-desc.svg',
  },
}

const TagSortToggle = (props: TagSortToggleProps) => {
  const { className, state, onStateChange } = props
  const { mode, dir } = state

  const { t } = useTranslation('common')

  const onToggleMode = (newMode: SortModesEnum) => {
    if (mode === newMode) {
      onStateChange({
        mode,
        dir: dir == 1 ? -1 : 1,
      })
    } else {
      onStateChange({
        mode: newMode,
        dir,
      })
    }
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
          onClick={() => onToggleMode(it)}
        >
          <Image src={SORT_ICONS[it][dir]} alt={mode} width={22} height={22} />
        </div>
      ))}
    </div>
  )
}

export default TagSortToggle
