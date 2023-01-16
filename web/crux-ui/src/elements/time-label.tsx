import { HOUR_IN_SECONDS } from '@app/const'
import useTranslation from 'next-translate/useTranslation'
import { DyoLabel, DyoLabelProps } from './dyo-label'

interface TimeLabelProps extends DyoLabelProps {
  seconds: number
}

const TimeLabel = (props: TimeLabelProps) => {
  const { seconds, ...forwardedProps } = props

  const { t } = useTranslation('common')

  const time = {
    seconds: Math.trunc(seconds % 60),
    minutes: Math.trunc((seconds / 60) % 60),
    hours: Math.trunc((seconds / HOUR_IN_SECONDS) % 24),
    days: Math.trunc(seconds / HOUR_IN_SECONDS / 24),
  }

  return (
    <DyoLabel {...forwardedProps}>
      {`${time.days ? t('days', time) : ''} 
        ${time.hours || time.days ? t('hours', time) : ''} 
        ${(time.minutes || time.hours) && !time.days ? t('minutes', time) : ''} 
        ${!time.hours && !time.days ? t('seconds', time) : ''}`}
    </DyoLabel>
  )
}

export default TimeLabel
