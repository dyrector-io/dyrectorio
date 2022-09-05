import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoSwitch } from '@app/elements/dyo-switch'
import { defaultApiErrorHandler } from '@app/errors'
import {
  CreateNotification,
  NotificationDetails,
  NotificationType,
  NOTIFICATION_EVENT_VALUES,
  NOTIFICATION_TYPE_VALUES,
  UpdateNotification,
} from '@app/models'
import { API_NOTIFICATIONS, notificationApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { notificationSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'
import { NotificationEventList } from './notification-event-list'

interface EditNotificationCardProps {
  notification?: NotificationDetails
  submitRef: MutableRefObject<() => Promise<any>>
  onSubmitted: (notifcation: NotificationDetails) => void
  className?: string
}

const EditNotificationCard = (props: EditNotificationCardProps) => {
  const { t } = useTranslation('notifications')

  const [notification, setNotification] = useState<NotificationDetails>(
    props.notification ?? {
      id: null,
      active: true,
      name: '',
      type: 'discord',
      url: '',
      creator: '',
      events: [...NOTIFICATION_EVENT_VALUES],
    },
  )

  const editMode = !!notification.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    initialValues: {
      ...notification,
    },
    validationSchema: notificationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const request: CreateNotification | UpdateNotification = {
        ...values,
      }

      const response = await (editMode
        ? sendForm('PUT', notificationApiUrl(notification.id), request as UpdateNotification)
        : sendForm('POST', API_NOTIFICATIONS, request as CreateNotification))

      if (response.ok) {
        const result = response.status == 200 ? ((await response.json()) as NotificationDetails) : { ...values }
        setNotification(result)
        props.onSubmitted(result as NotificationDetails)
      } else {
        handleApiError(response, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={props.className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editMode ? t('common:editName', { name: notification.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('description')}</DyoLabel>

      <form className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <DyoInput
            className="max-w-lg"
            grow
            name="name"
            type="name"
            label={t('common:name')}
            onChange={formik.handleChange}
            value={formik.values.name}
            message={formik.errors.name}
          />

          <div className="flex flex-col flex-wrap">
            <DyoLabel className="mt-8 mb-2.5">{t('notificationType')}</DyoLabel>

            <DyoChips
              choices={NOTIFICATION_TYPE_VALUES}
              initialSelection={formik.values.type}
              converter={(it: NotificationType) => t(`type.${it}`)}
              onSelectionChange={it => formik.setFieldValue('type', it, true)}
            />
          </div>

          <DyoInput
            className="max-w-lg"
            grow
            name="url"
            type="url"
            label={t('url')}
            onChange={formik.handleChange}
            value={formik.values.url}
            message={formik.errors.url}
          />

          <div className="flex flex-row justify-between mt-8 items-end">
            <div className="flex flex-col">
              <DyoLabel className="mb-2.5">{t('active')}</DyoLabel>

              <DyoSwitch fieldName="active" checked={formik.values.active} setFieldValue={formik.setFieldValue} />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <DyoLabel className="mb-2.5">{t('events')}</DyoLabel>

          <NotificationEventList
            value={formik.values.events}
            onChanged={value => formik.setFieldValue('events', value, false)}
          />
        </div>
      </form>
    </DyoCard>
  )
}

export default EditNotificationCard
