import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
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
import { notificationSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'
import { NotificationEventList } from './notification-event-list'

interface EditNotificationCardProps {
  notification?: NotificationDetails
  submitRef: MutableRefObject<() => Promise<any>>
  onNotificationEdited: (notifcation: NotificationDetails) => void
  className?: string
}

const EditNotificationCard = (props: EditNotificationCardProps) => {
  const { notification: propsNotification, submitRef, onNotificationEdited, className } = props

  const { t } = useTranslation('notifications')

  const [notification, setNotification] = useState<NotificationDetails>(
    propsNotification ?? {
      id: null,
      active: true,
      name: '',
      type: 'discord',
      url: '',
      creatorName: '',
      enabledEvents: [...NOTIFICATION_EVENT_VALUES],
    },
  )

  const editMode = !!notification.id

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    initialValues: {
      ...notification,
    },
    validationSchema: notificationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const request: CreateNotification | UpdateNotification = {
        ...values,
      }

      const res = await (editMode
        ? sendForm('PUT', notificationApiUrl(notification.id), request as UpdateNotification)
        : sendForm('POST', API_NOTIFICATIONS, request as CreateNotification))

      if (res.ok) {
        let result: NotificationDetails
        if (res.status !== 204) {
          result = (await res.json()) as NotificationDetails
        } else {
          result = {
            ...values,
          }
        }

        setNotification(result)
        setSubmitting(false)
        onNotificationEdited(result as NotificationDetails)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editMode ? t('common:editName', { name: notification.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('description')}</DyoLabel>

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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

          <div className="flex flex-col flex-wrap">
            <DyoLabel className="mt-8 mb-2.5">{t('notificationType')}</DyoLabel>

            <DyoChips
              choices={NOTIFICATION_TYPE_VALUES}
              selection={formik.values.type}
              converter={(it: NotificationType) => t(`type.${it}`)}
              onSelectionChange={async it => {
                await formik.setFieldValue('type', it)
                formik.validateField('url')
              }}
            />
          </div>

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
            value={formik.values.enabledEvents}
            onChanged={value => formik.setFieldValue('enabledEvents', value, false)}
          />
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditNotificationCard
