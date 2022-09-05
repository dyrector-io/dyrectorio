import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { NotificationDetails } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import NotificationStatusTag from './notification-status-tag'
import NotificationTypeTag from './notification-type-tag'

interface NotificationCardProps extends Omit<DyoCardProps, 'children'> {
  notification: NotificationDetails
  onClick?: () => void
}

const NotificationCard = (props: NotificationCardProps) => {
  const { t } = useTranslation('notifications')

  const { notification } = props

  const getDefaultImage = (
    <Image src="/notification.svg" width={18} height={20} alt={t('altNotificationPicture')} layout="fixed" />
  )

  return (
    <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
      <div className={clsx('flex flex-row flex-grow mb-2', props.onClick ? 'cursor-pointer' : null)}>
        <div className="flex items-center">{getDefaultImage}</div>

        <DyoHeading className="text-xl text-bright ml-2 my-auto mr-auto truncate" element="h3" onClick={props.onClick}>
          {notification.name}
        </DyoHeading>
      </div>

      <div className="flex wrap my-2">
        <p className="text-light break-all truncate">{notification.url}</p>
      </div>

      <div className="flex wrap my-2">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">{t('status')}</DyoLabel>

        <NotificationStatusTag className="px-2.5" />
      </div>

      <div className="flex flex-row flex-grow justify-end">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">
          {t('common:createdByName', { name: notification.creator })}
        </DyoLabel>

        <NotificationTypeTag className="px-2.5" type={notification.type} />
      </div>
    </DyoCard>
  )
}

export default NotificationCard
