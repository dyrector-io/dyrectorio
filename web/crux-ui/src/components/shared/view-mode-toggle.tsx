import clsx from 'clsx'
import Image from 'next/image'

export type ViewMode = 'tile' | 'list'

export interface ViewModeToggleProps {
  className?: string
  viewMode: ViewMode
  onViewModeChanged: (mode: ViewMode) => void
}

const ViewModeToggle = (props: ViewModeToggleProps) => {
  const { className, viewMode, onViewModeChanged } = props

  return (
    <div
      className={clsx(className, 'px-1 bg-medium text-white font-semibold rounded cursor-pointer h-10 flex flex-row')}
    >
      <div
        className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'tile' && 'bg-dyo-turquoise rounded')}
        onClick={() => onViewModeChanged('tile')}
      >
        <Image src="/view_tile.svg" width={18} height={18} />
      </div>
      <div
        className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'list' && 'bg-dyo-turquoise rounded')}
        onClick={() => onViewModeChanged('list')}
      >
        <Image src="/view_table.svg" width={18} height={18} />
      </div>
    </div>
  )
}

export default ViewModeToggle
