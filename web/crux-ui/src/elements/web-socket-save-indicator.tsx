import { WebSocketSaveState } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import DyoIcon from './dyo-icon'
import LoadingIndicator from './loading-indicator'

interface WebSocketSaveIndicatorProps {
  className?: string
  state: WebSocketSaveState
}

const WebSocketSaveIndicator = (props: WebSocketSaveIndicatorProps) => {
  const { t } = useTranslation('common')

  const { className, state } = props

  const label = t(`saveState.${state}`)

  return (
    <div className={clsx('flex flex-row items-center gap-2', className)}>
      <span className="text-bright">{label}</span>

      {state === 'saved' ? (
        <DyoIcon src="/check.svg" alt={label} size="md" />
      ) : state === 'disconnected' ? (
        <DyoIcon src="/clear.svg" alt={label} size="md" />
      ) : (
        <LoadingIndicator />
      )}
    </div>
  )
}

export default WebSocketSaveIndicator
