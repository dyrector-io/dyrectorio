import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Notification } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import NotificationStatusTag from './notification-status-tag'
import NotificationTypeTag from './notification-type-tag'

interface NotificationCardProps extends Omit<DyoCardProps, 'children'> {
  notification: Notification
  disableTitleHref?: boolean
}

const NotificationCard = (props: NotificationCardProps) => {
  const { notification, disableTitleHref, className } = props

  const { t } = useTranslation('notifications')
  const teams = useTeamRoutes()
  const titleHref = teams.notification.details(notification.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoLink
        className={clsx('flex flex-row', disableTitleHref ? 'pointer-events-none' : null)}
        href={titleHref}
        qaLabel="notification-card-title"
      >
        <div className="flex items-center mb-2">
          <DyoIcon className="aspect-square" src="/notification.svg" size="md" alt={t('altNotificationPicture')} />
        </div>

        <DyoHeading className="text-xl text-bright ml-2 my-auto mr-auto truncate" element="h3">
          {notification.name}
        </DyoHeading>
      </DyoLink>

      <div className="flex wrap my-2">
        <p className="text-light break-all truncate">{notification.url}</p>
      </div>

      <div className="flex wrap my-2">
        <DyoLabel className="mr-4 mt-auto py-0.5 leading-4">{t('status')}</DyoLabel>

        <NotificationStatusTag className="px-2.5" active={notification.active} />
      </div>

      <div className="flex flex-row flex-grow justify-end">
        <NotificationTypeTag className="px-2.5" type={notification.type} />
      </div>
    </DyoCard>
  )
}

export default NotificationCard
