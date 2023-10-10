import DyoIcon from '@app/elements/dyo-icon'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

export type InspectViewMode = 'table' | 'json'

export interface InspectViewModeToggleProps {
  className?: string
  viewMode: InspectViewMode
  onViewModeChanged: (mode: InspectViewMode) => void
}

const InspectViewModeToggle = (props: InspectViewModeToggleProps) => {
  const { className, viewMode, onViewModeChanged } = props

  const { t } = useTranslation('nodes')

  return (
    <div
      className={clsx(className, 'px-1 bg-medium text-white font-semibold rounded cursor-pointer h-10 flex flex-row')}
    >
      <div
        className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'table' && 'bg-dyo-turquoise rounded')}
        onClick={() => onViewModeChanged('table')}
      >
        <DyoIcon src="/view_table.svg" alt={t('viewMode.table')} />
      </div>
      <div
        className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'json' && 'bg-dyo-turquoise rounded')}
        onClick={() => onViewModeChanged('json')}
      >
        <DyoIcon src="/view_json.svg" alt={t('viewMode.json')} />
      </div>
    </div>
  )
}

export default InspectViewModeToggle
