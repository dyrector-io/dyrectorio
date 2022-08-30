import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { NotificationItem } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import NotificationTypeTag from './notification-type-tag'

interface NotificationCardProps extends Omit<DyoCardProps, 'children'> {
  notification: NotificationItem
  onClick?: () => void
}

const NotificationCard = (props: NotificationCardProps) => {
  const { t } = useTranslation('notifications')

  const { notification } = props

  const getDefaultImage = (
    <Image src="/notification.svg" width={17} height={21} alt={t('altNotificationPicture')} layout="fixed" />
  )

  return (
    <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
      <div className={clsx('flex flex-row flex-grow', props.onClick ? 'cursor-pointer' : null)}>
        <div>{getDefaultImage}</div>

        <DyoHeading className="text-xl text-bright ml-2 my-auto mr-auto truncate" element="h3" onClick={props.onClick}>
          {notification.name}
        </DyoHeading>
      </div>

      <div className="flex wrap my-4">
        <p className="text-light break-all line-clamp-2">{notification.url}</p>
      </div>

      <div className="flex flex-row flex-grow justify-end">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">
          {t('common:createdByName', { name: notification.creator })}
        </DyoLabel>

        <NotificationTypeTag type={notification.type} />
      </div>
    </DyoCard>
  )
}

export default NotificationCard
