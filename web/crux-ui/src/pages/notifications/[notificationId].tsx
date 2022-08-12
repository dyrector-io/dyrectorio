import { Layout, PageHead } from '@app/components/layout'
import EditNotificationCard from '@app/components/notifications/edit-notification-card'
import NotificationCard from '@app/components/notifications/notification-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { defaultApiErrorHandler } from '@app/errors'
import { NotificationDetails, NotificationItem } from '@app/models'
import { API_NOTIFICATIONS, notificationUrl, ROUTE_NOTIFICATIONS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

interface NotificationDetailsPageProps {
  notification: NotificationDetails
}

const NotificationDetailsPage = (props: NotificationDetailsPageProps) => {
  const { t } = useTranslation('notifications')
  const router = useRouter()

  const [notification, setNotification] = useState<NotificationDetails>(props.notification)
  const [isEditMode, setIsEditMode] = useState(false)
  const submitRef = useRef<() => Promise<void>>()
  const handleApiError = defaultApiErrorHandler(t)

  const onDelete = async () => {
    const res = await fetch(API_NOTIFICATIONS + `/${notification.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    router.back()
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:notification'),
    url: ROUTE_NOTIFICATIONS,
  }

  const onSubmitted = (notification: NotificationItem) => {
    setIsEditMode(false)
    setNotification(notification as NotificationDetails)
  }

  return (
    <Layout>
      <PageHead title={t('title-notification', { name: notification.name })} />
      <PageHeading
        pageLink={pageLink}
        subLinks={[
          {
            name: notification.name,
            url: notificationUrl(notification.id),
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={isEditMode}
          setEditing={setIsEditMode}
          submitRef={submitRef}
          deleteModalTitle={t('common:confirmDelete', { name: notification.name })}
          deleteModalDescription={t('common:deleteDescription', {
            name: notification.name,
          })}
        />
      </PageHeading>

      {!isEditMode ? (
        <NotificationCard notification={notification as NotificationItem} />
      ) : (
        <EditNotificationCard
          className="p-8"
          notification={notification}
          onSubmitted={onSubmitted}
          submitRef={submitRef}
        />
      )}
    </Layout>
  )
}

export default NotificationDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const notificationId = context.query.notificationId as string

  return {
    props: {
      notification: await cruxFromContext(context).notificiations.getNotificationDetails(notificationId),
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
