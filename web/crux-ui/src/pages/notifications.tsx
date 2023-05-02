import { Layout } from '@app/components/layout'
import EditNotificationCard from '@app/components/notifications/edit-notification-card'
import NotificationCard from '@app/components/notifications/notification-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoWrap from '@app/elements/dyo-wrap'
import { Notification } from '@app/models'
import { API_NOTIFICATIONS, notificationUrl, ROUTE_NOTIFICATIONS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

interface NotificationsPageProps {
  notifications: Notification[]
}

const NotificationsPage = (props: NotificationsPageProps) => {
  const { notifications: propsNotifications } = props

  const { t } = useTranslation('notifications')

  const [creating, setCreating] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<Notification[]>(propsNotifications)

  const pageLink: BreadcrumbLink = {
    name: t('common:notifications'),
    url: ROUTE_NOTIFICATIONS,
  }

  const onSubmitted = (item: Notification) => {
    setCreating(false)
    setNotifications([...notifications, item])
  }

  const submitRef = useRef<() => Promise<any>>()

  return (
    <Layout title={t('common:notifications')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>
      {creating && (
        <EditNotificationCard onNotificationEdited={onSubmitted} submitRef={submitRef} className="mb-8 px-8 py-6" />
      )}
      {notifications.length ? (
        <>
          <DyoLabel className="w-full px-2 text-xl" textColor="text-bright">
            {t('webhooks')}
          </DyoLabel>
          <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3 p-2">
            {notifications.map((it, index) => (
              <NotificationCard
                className={clsx('max-h-64 w-full p-6')}
                key={`notification-${index}`}
                notification={it}
                titleHref={notificationUrl(it.id)}
              />
            ))}
          </DyoWrap>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}

const getPageServerSideProps = async (context: NextPageContext) => {
  const notifications = await getCruxFromContext<Notification[]>(context, API_NOTIFICATIONS)

  return {
    props: {
      notifications,
    },
  }
}

export default NotificationsPage

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
