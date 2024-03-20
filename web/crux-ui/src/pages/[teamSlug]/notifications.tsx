import { Layout } from '@app/components/layout'
import EditNotificationCard from '@app/components/notifications/edit-notification-card'
import NotificationCard from '@app/components/notifications/notification-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoWrap from '@app/elements/dyo-wrap'
import useAnchor from '@app/hooks/use-anchor'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Notification } from '@app/models'
import { ANCHOR_NEW, ListRouteOptions, TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface NotificationsPageProps {
  notifications: Notification[]
}

const NotificationsPage = (props: NotificationsPageProps) => {
  const { notifications: propsNotifications } = props

  const { t } = useTranslation('notifications')
  const routes = useTeamRoutes()
  const router = useRouter()
  const anchor = useAnchor()

  const [notifications, setNotifications] = useState<Notification[]>(propsNotifications)

  const creating = anchor === ANCHOR_NEW
  const submit = useSubmit()

  const onNotificationCreated = async (noti: Notification) => {
    setNotifications([...notifications, noti])
    await router.replace(routes.notification.list())
  }

  const onRouteOptionsChange = async (routeOptions: ListRouteOptions) => {
    await router.replace(routes.notification.list(routeOptions))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:notifications'),
    url: routes.notification.list(),
  }

  return (
    <Layout title={t('common:notifications')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} onRouteOptionsChange={onRouteOptionsChange} submit={submit} />
      </PageHeading>

      {creating && (
        <EditNotificationCard onNotificationEdited={onNotificationCreated} submit={submit} className="mb-8 px-8 py-6" />
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

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const notifications = await getCruxFromContext<Notification[]>(context, routes.notification.api.list())

  return {
    props: {
      notifications,
    },
  }
}

export default NotificationsPage

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
