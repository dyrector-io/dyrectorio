import { DyoButton } from '@app/elements/dyo-button'
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
  NotificationItem,
  NotificationType,
  NOTIFICATION_TYPE_VALUES,
  UpdateNotification,
} from '@app/models'
import { notificationApiHookUrl, notificationApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { notificationSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface EditNotificationCardProps {
  notification?: NotificationDetails
  submitRef: MutableRefObject<() => Promise<any>>
  onSubmitted: (notifcation: NotificationItem) => void
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
      createdBy: '',
    },
  )

  const isEditMode = !!notification.id

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

      const response = await (isEditMode
        ? sendForm('PUT', notificationApiUrl(notification.id), request as UpdateNotification)
        : sendForm('POST', notificationApiUrl(), request as CreateNotification))

      if (response.ok) {
        const result = response.status == 200 ? ((await response.json()) as NotificationDetails) : { ...values }
        setNotification(result)
        props.onSubmitted(result as NotificationItem)
      } else {
        handleApiError(response, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  const [testDisabled, setTestDisabled] = useState<boolean>(true)

  useEffect(() => {
    setTestDisabled(formik.errors.url != undefined || formik.values.url.length == 0)
  }, [formik.errors.url, formik.values.url])

  const onTestHook = async () => {
    const url = formik.values.url as string

    var res = await fetch(notificationApiHookUrl(), {
      method: 'POST',
      body: url,
    })

    if (res.ok) {
      const valid = (await res.json()) as boolean
      valid ? toast.success(t('hook.success')) : toast.error(t('hook.error'))
    } else {
      toast.error(t('hook.error'))
    }
  }

  return (
    <>
      <DyoCard className={props.className}>
        <DyoHeading element="h4" className="text-lg text-bright">
          {isEditMode ? t('common:editName', { name: notification.name }) : t('new')}
        </DyoHeading>

        <DyoLabel className="text-light">{t('tips.common')}</DyoLabel>

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
                onSelectionChange={it => formik.setFieldValue('type', it, false)}
              />
            </div>

            <div className="flex flex-row justify-between mt-8 items-end">
              <div className="flex flex-col">
                <DyoLabel className="mb-2.5">{t('active')}</DyoLabel>

                <DyoSwitch fieldName="active" checked={formik.values.active} setFieldValue={formik.setFieldValue} />
              </div>

              <DyoButton type="button" className="px-4 whitespace-nowrap" onClick={onTestHook} disabled={testDisabled}>
                {t('hook.button')}
              </DyoButton>
            </div>
          </div>
        </form>
      </DyoCard>
    </>
  )
}

export default EditNotificationCard
