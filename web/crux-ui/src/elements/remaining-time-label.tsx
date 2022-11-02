import useTranslation from 'next-translate/useTranslation'
import { DyoLabel, DyoLabelProps } from './dyo-label'

interface RemainingTimeLabelProps extends DyoLabelProps {
  seconds: number
}

const RemainingTimeLabel = (props: RemainingTimeLabelProps) => {
  const { seconds, ...forwardedProps } = props

  const { t } = useTranslation('common')

  const time = {
    minutes: Math.trunc(seconds / 60),
    seconds: Math.trunc(seconds % 60),
  }

  return <DyoLabel {...forwardedProps}>{t(time.minutes >= 1 ? 'minutesSeconds' : 'seconds', time)}</DyoLabel>
}

export default RemainingTimeLabel
