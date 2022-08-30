import DyoTag from '@app/elements/dyo-tag'
import { NotificationType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface NotificationTypeTagProps {
  className?: string
  type: NotificationType
}

const NotificationTypeTag = (props: NotificationTypeTagProps) => {
  const { t } = useTranslation('notification')

  return (
    <DyoTag className={props.className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(`type.${props.type}`).toUpperCase()}
    </DyoTag>
  )
}

export default NotificationTypeTag
