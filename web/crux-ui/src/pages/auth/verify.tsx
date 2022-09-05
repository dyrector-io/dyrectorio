import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, AUTH_RESEND_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import useTimer from '@app/hooks/use-timer'
import { DyoErrorDto, VerifyEmail } from '@app/models'
import { API_VERIFICATION, ROUTE_LOGIN, ROUTE_SETTINGS } from '@app/routes'
import { findAttributes, findError, findMessage, isDyoError, redirectTo, sendForm, upsertDyoError } from '@app/utils'
import { SelfServiceVerificationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { forwardCookie, obtainKratosSession, userVerified } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface VerifyProps {
  email: string
  flow: SelfServiceVerificationFlow
  recaptchaSiteKey?: string
}

const VerifyPage = (props: VerifyProps) => {
  const { t } = useTranslation('verify')

  const { flow, email, recaptchaSiteKey } = props

  const recaptcha = useRef<ReCAPTCHA>()
  const [ui, setUi] = useState(flow.ui)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(-1, recaptchaSiteKey ? () => recaptcha.current.reset() : null)

  const formik = useFormik({
    initialValues: {
      email,
    },
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: VerifyEmail = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        captcha,
        email: values.email,
      }

      const res = await sendForm('POST', API_VERIFICATION, data)

      setSent(res.ok)
      if (res.ok) {
        startCountdown(AUTH_RESEND_DELAY)
        setUi(flow.ui)
      } else {
        recaptcha.current?.reset()

        const result = await res.json()

        if (isDyoError(result)) {
          setErrors(upsertDyoError(errors, result as DyoErrorDto))
        } else if (result?.ui) {
          setUi(result.ui)
        } else {
          toast(t('errors:internalError'))
        }
      }
    },
  })

  const submitDisabled = countdown > 0

  return (
    <SingleFormLayout title={t('verification')}>
      <DyoCard className="p-8 m-auto">
        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading className="max-w-xs">{t('verification')}</DyoSingleFormHeading>

          <DyoInput
            disabled
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'email')}
          />

          {sent ? <p className="w-80 text-bright text-center mt-8">{t('linkSent')}</p> : null}

          <DyoMessage
            message={findError(errors, 'captcha', it =>
              t(`errors:${it.error}`, {
                name: it.value,
              }),
            )}
            messageType="error"
          />

          <DyoButton className="mt-8" type="submit" disabled={submitDisabled}>
            {sent ? `${t('common:resend')} ${countdown > 0 ? countdown : ''}`.trim() : t('common:send')}
          </DyoButton>

          {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
        </form>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default VerifyPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flowId = context.query.flow as string

  const session = await obtainKratosSession(context.req)
  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  if (userVerified(session.identity)) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const { cookie } = context.req.headers
  const flow = flowId
    ? await kratos.getSelfServiceVerificationFlow(flowId, cookie)
    : await kratos.initializeSelfServiceVerificationFlowForBrowsers()

  forwardCookie(context, flow)

  return {
    props: {
      email: session.identity.traits.email,
      flow: flow.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
