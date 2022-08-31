import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTag from '@app/elements/dyo-tag'
import { NotificationDetails } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface NotificationCardProps extends Omit<DyoCardProps, 'children'> {
  notification: NotificationDetails
  onClick?: () => void
}

const NotificationCard = (props: NotificationCardProps) => {
  const { notification, onClick, className } = props

  const { t } = useTranslation('notifications')

  const getDefaultImage = (
    <Image src="/notification.svg" width={17} height={21} alt={t('altNotificationPicture')} layout="fixed" />
  )

  const activeToBgColor = () => (notification.active ? 'bg-dyo-turquoise' : 'bg-warning-orange')
  const activeToTextColor = () => (notification.active ? 'text-dyo-turquoise' : 'text-warning-orange')

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <div className={clsx('flex flex-row flex-grow', onClick ? 'cursor-pointer' : null)}>
        <div>{getDefaultImage}</div>

        <DyoHeading className="text-xl text-bright ml-2 my-auto mr-auto truncate" element="h3" onClick={onClick}>
          {notification.name}
        </DyoHeading>
      </div>

      <div className="flex wrap my-2">
        <p className="text-light break-all line-clamp-2">{notification.url}</p>
      </div>

      <div className="flex wrap my-2">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">{t('status')}</DyoLabel>
        <DyoTag color={activeToBgColor()} textColor={activeToTextColor()} className="px-2.5">
          {t(notification.active ? 'active' : 'inactive')}
        </DyoTag>
      </div>

      <div className="flex flex-row flex-grow justify-end">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">
          {t('common:createdByName', { name: notification.creator })}
        </DyoLabel>
        <DyoTag color="bg-dyo-turquoise" textColor="text-dyo-turquoise" className="px-2.5">
          {t(`type.${notification.type}`)}
        </DyoTag>
      </div>
    </DyoCard>
  )
}

export default NotificationCard
