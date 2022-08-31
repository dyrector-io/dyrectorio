import DyoTag from '@app/elements/dyo-tag'
import useTranslation from 'next-translate/useTranslation'

interface NotificationStatusTagProps {
  className?: string
  active?: boolean
}

const NotificationStatusTag = (props: NotificationStatusTagProps) => {
  const { t } = useTranslation('notification')

  const { active } = props

  const color = active ? 'bg-dyo-turquoise' : 'bg-warning-orange'
  const textColor = active ? 'text-dyo-turquoise' : 'text-warning-orange'

  return (
    <DyoTag className={props.className} color={color} textColor={textColor}>
      {t(active ? 'active' : 'inactive')}
    </DyoTag>
  )
}

export default NotificationStatusTag
