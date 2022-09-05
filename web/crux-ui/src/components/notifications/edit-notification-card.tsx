import { WEBOOK_TEST_DELAY } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoSwitch } from '@app/elements/dyo-switch'
import { defaultApiErrorHandler } from '@app/errors'
import { useThrottling } from '@app/hooks/use-throttleing'
import {
  CreateNotification,
  NotificationDetails,
  NotificationType,
  NOTIFICATION_TYPE_VALUES,
  UpdateNotification,
} from '@app/models'
import { API_NOTIFICATIONS, notificationApiHookUrl, notificationApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { notificationSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'
import toast from 'react-hot-toast'

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
    },
  )

  const throttle = useThrottling(WEBOOK_TEST_DELAY)

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

  const onTestHook = async () => {
    if (!editMode) {
      return
    }

    const res = await fetch(notificationApiHookUrl(notification.id), {
      method: 'POST',
    })

    res.ok ? toast.success(t('hook.success')) : toast.error(t('hook.error'))
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
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col flex-wrap">
            <DyoLabel className="mt-8 mb-2.5">{t('notificationType')}</DyoLabel>

            <DyoChips
              choices={NOTIFICATION_TYPE_VALUES}
              initialSelection={formik.values.type}
              converter={(it: NotificationType) => t(`type.${it}`)}
              onSelectionChange={it => formik.setFieldValue('type', it, true)}
            />
          </div>

          <div className="flex flex-row justify-between mt-8 items-end">
            <div className="flex flex-col">
              <DyoLabel className="mb-2.5">{t('active')}</DyoLabel>

              <DyoSwitch fieldName="active" checked={formik.values.active} setFieldValue={formik.setFieldValue} />
            </div>

            {editMode && (
              <DyoButton type="button" className="px-4 whitespace-nowrap" onClick={() => throttle(onTestHook)}>
                {t('hook.textWebhook')}
              </DyoButton>
            )}
          </div>
        </div>
      </form>
    </DyoCard>
  )
}

export default EditNotificationCard
