import useTimer from '@app/hooks/use-timer'
import { WebSocketSaveState } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import DyoIcon from './dyo-icon'
import LoadingIndicator from './loading-indicator'

interface WebSocketSaveIndicatorProps {
  className?: string
  state: WebSocketSaveState
}

const FADE_TIMEOUT = 3

const WebSocketSaveIndicator = (props: WebSocketSaveIndicatorProps) => {
  const { className, state } = props

  const { t } = useTranslation('common')

  const [hidden, setHidden] = useState(state === 'saved')
  const [remaining, scheduleFade, stopFade] = useTimer(null, () => setHidden(true))

  const fadeScheduled = remaining > 0
  const shouldHide = state === 'saved' && !hidden && !fadeScheduled
  useEffect(() => {
    if (shouldHide) {
      scheduleFade(FADE_TIMEOUT)
    }
  }, [shouldHide, scheduleFade])

  const shouldShow = state !== 'saved' && state !== 'connected' && hidden
  useEffect(() => {
    if (!shouldShow) {
      return
    }

    if (fadeScheduled) {
      stopFade()
    }

    setHidden(false)
  }, [shouldShow, fadeScheduled, stopFade])

  useEffect(() => {
    if (state === 'connected') {
      setHidden(true)
      stopFade()
    }
  }, [state, stopFade])

  const label = state ? t(`saveState.${state}`) : null

  return (
    !!state && (
      <div className={clsx('flex flex-row items-center gap-2', hidden ? 'animate-fade' : null, className)}>
        <span className="text-bright">{label}</span>

        {state === 'saved' || state === 'connected' ? (
          <DyoIcon src="/check.svg" alt={label} size="md" />
        ) : state === 'disconnected' ? (
          <DyoIcon src="/clear.svg" alt={label} size="md" />
        ) : (
          <LoadingIndicator />
        )}
      </div>
    )
  )
}

export default WebSocketSaveIndicator
