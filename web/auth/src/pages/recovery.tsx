import { SelfServiceRecoveryFlow } from '@ory/kratos-client'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'
import { FormCard } from '../components/form/form-card'
import { FormHeader } from '../components/form/form-header'
import { FormMessage } from '../components/form/form-message'
import { LabeledInput } from '../components/form/labeled-input'
import { SingleFormLayout } from '../components/layout'
import {
  API_RECOVERY,
  ATTRIB_CSRF,
  RESEND_DELAY,
  ROUTE_INVITE,
  ROUTE_RECOVERY,
  ROUTE_SETTINGS,
} from '@app/const'
import { useTimer } from '../hooks/use-timer'
import kratos from '@server/kratos'
import { DyoErrorDto, RecoveryDto } from '@server/models'
import {
  findAttributes,
  findError,
  findMessage,
  forwardCookie,
  isDyoError,
  obtainSessionWithCookie,
  redirectTo,
  upsertDyoError,
} from '@app/utils'

const RecoveryPage = (props: SelfServiceRecoveryFlow) => {
  const { t } = useTranslation('recovery')
  const router = useRouter()
  const token = router.query['token'] as string

  const flow = props

  const recaptcha = useRef<ReCAPTCHA>()

  const [ui, setUi] = useState(flow.ui)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(RESEND_DELAY, () =>
    recaptcha.current.reset(),
  )

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: async values => {
      setSent(false)
      const captcha = await recaptcha.current.executeAsync()

      const data: RecoveryDto = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: values.email,
        token,
      }

      const res = await fetch(API_RECOVERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      setSent(res.ok)
      if (res.ok) {
        startCountdown()
        setUi(flow.ui)
      } else {
        recaptcha.current.reset()

        const data = await res.json()

        if (isDyoError(data)) {
          setErrors(upsertDyoError(errors, data as DyoErrorDto))
        } else if (data?.ui) {
          setUi(data.ui)
        } else {
          toast(t('errors:INTERNAL_SERVER_ERROR'))
        }
      }
    },
  })

  const submitLabel = t(`common:${sent ? 'resend' : 'send'}`)
  const submitDisabled = countdown > 0

  return (
    <SingleFormLayout>
      <FormCard
        submitLabel={
          !submitDisabled ? submitLabel : `${submitLabel} (${countdown})`
        }
        submitDisabled={submitDisabled}
        onSubmit={formik.handleSubmit}
      >
        <FormHeader>{t('recovery')}</FormHeader>

        <LabeledInput
          label={t('common:email')}
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          message={findMessage(ui, 'email')}
        />

        {sent ? <p className="mt-8 font-light-gray">{t('linkSent')}</p> : null}

        <FormMessage
          message={findError(errors, 'captcha', it =>
            t(`errors:${it.error}`, {
              name: it.value,
            }),
          )}
          messageType="error"
        />

        <ReCAPTCHA
          ref={recaptcha}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        />
      </FormCard>
    </SingleFormLayout>
  )
}

export default RecoveryPage

export async function getServerSideProps(context: NextPageContext) {
  const [session, cookie] = await obtainSessionWithCookie(context, kratos)
  if (session && cookie) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flowId = context.query['flow'] as string
  try {
    const flow = flowId
      ? await kratos.getSelfServiceRecoveryFlow(flowId, cookie)
      : await kratos.initializeSelfServiceRecoveryFlowForBrowsers()
    forwardCookie(context, flow)

    return {
      props: flow.data,
    }
  } catch (e) {
    if (e?.response?.status === 403) {
      return redirectTo(`${ROUTE_INVITE}?expired=true`)
    } else {
      return redirectTo(ROUTE_RECOVERY)
    }
  }
}
