import { SelfServiceVerificationFlow } from '@ory/kratos-client'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React, { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'
import { FormCard } from '../components/form/form-card'
import { FormHeader } from '../components/form/form-header'
import { FormMessage } from '../components/form/form-message'
import { LabeledInput } from '../components/form/labeled-input'
import { SingleFormLayout } from '../components/layout'
import {
  API_VERIFICATION,
  ATTRIB_CSRF,
  RESEND_DELAY,
  ROUTE_LOGIN,
  ROUTE_SETTINGS,
} from '@app/const'
import { useTimer } from '../hooks/use-timer'
import kratos from '@server/kratos'
import { DyoErrorDto, VerifyDto } from '@server/models'
import {
  findAttributes,
  findError,
  findMessage,
  forwardCookie,
  isDyoError,
  obtainSessionWithCookie,
  redirectTo,
  upsertDyoError,
  userVerified,
} from '@app/utils'

interface VerifyProps {
  email: string
  flow: SelfServiceVerificationFlow
}

const VerifyPage = (props: VerifyProps) => {
  const { t } = useTranslation('verify')

  const { flow, email } = props

  const [ui, setUi] = useState(flow.ui)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(RESEND_DELAY, () =>
    recaptcha.current.reset(),
  )

  const recaptcha = useRef<ReCAPTCHA>()

  const formik = useFormik({
    initialValues: {
      email,
    },
    onSubmit: async values => {
      setSent(false)
      const captcha = await recaptcha.current.executeAsync()

      const data: VerifyDto = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        captcha,
        email: values.email,
      }

      const res = await fetch(API_VERIFICATION, {
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
        submitLabel={submitLabel}
        submitDisabled={submitDisabled}
        onSubmit={formik.handleSubmit}
      >
        <FormHeader>{t('verification')}</FormHeader>

        <LabeledInput
          disabled
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

export default VerifyPage

export async function getServerSideProps(context: NextPageContext) {
  const flowId = context.query['flow'] as string

  const [session, cookie] = await obtainSessionWithCookie(context, kratos)
  if (!session || !cookie) {
    return redirectTo(ROUTE_LOGIN)
  }

  if (userVerified(session.identity)) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = flowId
    ? await kratos.getSelfServiceVerificationFlow(flowId, cookie)
    : await kratos.initializeSelfServiceVerificationFlowForBrowsers()

  forwardCookie(context, flow)

  return {
    props: {
      email: session.identity.traits.email,
      flow: flow.data,
    },
  }
}
