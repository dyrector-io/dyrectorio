import { Layout } from '@app/components/layout'
import EditNotificationCard from '@app/components/notifications/edit-notification-card'
import NotificationCard from '@app/components/notifications/notification-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import DyoWrap from '@app/elements/dyo-wrap'
import { NotificationItem } from '@app/models'
import { notificationUrl, ROUTE_NOTIFICATIONS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

interface NotificationsPageProps {
  notifications: NotificationItem[]
}

const NotificationsPage = (props: NotificationsPageProps) => {
  const { t } = useTranslation('notifications')
  const router = useRouter()

  const [creating, setCreating] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(props.notifications)

  const pageLink: BreadcrumbLink = {
    name: t('common:notifications'),
    url: ROUTE_NOTIFICATIONS,
  }

  const onSubmitted = (item: NotificationItem) => {
    setCreating(false)
    setNotifications([...notifications, item])
  }

  const submitRef = useRef<() => Promise<any>>()

  return (
    <Layout title={t('common:notifications')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>
      {creating && <EditNotificationCard onSubmitted={onSubmitted} submitRef={submitRef} className="mb-8 px-8 py-6" />}

      <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3 p-2">
        {notifications.map((it, index) => {
          return (
            <NotificationCard
              className={clsx('max-h-72 w-full p-8 my-2')}
              key={`notification-${index}`}
              notification={it}
              onClick={() => router.push(notificationUrl(it.id))}
            />
          )
        })}
      </DyoWrap>
    </Layout>
  )
}

const getPageServerSideProps = async (context: NextPageContext) => {
  return {
    props: {
      notifications: await cruxFromContext(context).notificiations.getAll(),
    },
  }
}

export default NotificationsPage

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
