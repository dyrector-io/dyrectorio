import DyoTag from '@app/elements/dyo-tag'
import { NotificationType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface NotificationTypeTagProps {
  className?: string
  type: NotificationType
}

const NotificationTypeTag = (props: NotificationTypeTagProps) => {
  const { className, type } = props

  const { t } = useTranslation('notification')

  return (
    <DyoTag className={className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(`type.${type}`).toUpperCase()}
    </DyoTag>
  )
}

export default NotificationTypeTag
