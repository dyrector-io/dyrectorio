import { Layout } from '@app/components/layout'
import EditNotificationCard from '@app/components/notifications/edit-notification-card'
import NotificationCard from '@app/components/notifications/notification-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { WEBOOK_TEST_DELAY } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { defaultApiErrorHandler } from '@app/errors'
import { useThrottling } from '@app/hooks/use-throttleing'
import { NotificationDetails } from '@app/models'
import { notificationApiHookUrl, notificationApiUrl, notificationUrl, ROUTE_NOTIFICATIONS } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface NotificationDetailsPageProps {
  notification: NotificationDetails
}

const NotificationDetailsPage = (props: NotificationDetailsPageProps) => {
  const { notification: propsNotification } = props

  const { t } = useTranslation('notifications')
  const router = useRouter()

  const [notification, setNotification] = useState<NotificationDetails>(propsNotification)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<void>>()
  const handleApiError = defaultApiErrorHandler(t)

  const throttle = useThrottling(WEBOOK_TEST_DELAY)

  const onDelete = async () => {
    const res = await fetch(notificationApiUrl(notification.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    router.back()
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:notifications'),
    url: ROUTE_NOTIFICATIONS,
  }

  const onSubmitted = (item: NotificationDetails) => {
    setEditing(false)
    setNotification(item as NotificationDetails)
  }

  const onTestHook = async () => {
    const res = await fetch(notificationApiHookUrl(notification.id), {
      method: 'POST',
    })

    res.ok ? toast.success(t('hook.success')) : toast.error(t('hook.error'))
  }

  return (
    <Layout title={t('notificationsName', { name: notification.name })}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: notification.name,
            url: notificationUrl(notification.id),
          },
        ]}
      >
        {!editing && (
          <DyoButton type="button" className="px-4 mr-4 whitespace-nowrap" onClick={() => throttle(onTestHook)}>
            {t('hook.textWebhook')}
          </DyoButton>
        )}
        <DetailsPageMenu
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          submitRef={submitRef}
          deleteModalTitle={t('common:confirmDelete', { name: notification.name })}
          deleteModalDescription={t('common:deleteDescription', {
            name: notification.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <NotificationCard notification={notification} />
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
