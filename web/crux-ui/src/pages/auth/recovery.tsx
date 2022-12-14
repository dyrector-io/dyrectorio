import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, AUTH_RESEND_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import useTimer from '@app/hooks/use-timer'
import { DyoErrorDto, RecoverEmail } from '@app/models'
import { API_RECOVERY, ROUTE_INDEX, ROUTE_RECOVERY, ROUTE_RECOVERY_EXPIRED } from '@app/routes'
import { findAttributes, findError, findMessage, isDyoError, redirectTo, upsertDyoError } from '@app/utils'
import { RecoveryFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { forwardCookie, obtainKratosSession } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface RecoveryPageProps {
  flow: RecoveryFlow
  recaptchaSiteKey?: string
}

const RecoveryPage = (props: RecoveryPageProps) => {
  const { t } = useTranslation('recovery')
  const router = useRouter()
  const token = router.query.token as string

  const { flow, recaptchaSiteKey } = props

  const recaptcha = useRef<ReCAPTCHA>()

  const [ui, setUi] = useState(flow.ui)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(-1, () => (recaptchaSiteKey ? recaptcha.current.reset() : null))

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: RecoverEmail = {
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
    <SingleFormLayout title={t('recovery')}>
      <DyoCard className="text-bright p-8 m-auto">
        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('recovery')}</DyoSingleFormHeading>

          <DyoInput
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'email')}
          />

          {sent ? <p className="w-80 mx-auto mt-8">{t('linkSent')}</p> : null}

          <DyoMessage
            message={findError(errors, 'captcha', it =>
              t(`errors:${it.error}`, {
                name: it.value,
              }),
            )}
            messageType="error"
          />

          <DyoButton className="mt-8" disabled={submitDisabled} type="submit">
            {sent ? `${t('common:resend')} ${countdown > 0 ? countdown : ''}`.trim() : t('common:send')}
          </DyoButton>

          {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
        </form>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default RecoveryPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const session = await obtainKratosSession(context.req)

  if (session) {
    return redirectTo(ROUTE_INDEX)
  }

  const flowId = context.query.flow as string
  const { cookie } = context.req.headers
  try {
    const flow = flowId
      ? await kratos.getRecoveryFlow({
          id: flowId,
          cookie,
        })
      : await kratos.createBrowserRecoveryFlow()

    forwardCookie(context, flow)

    return {
      props: {
        flow: flow.data,
        recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
      },
    }
  } catch (err) {
    if (err?.response?.status === 403) {
      return redirectTo(ROUTE_RECOVERY_EXPIRED)
    }
    return redirectTo(ROUTE_RECOVERY)
  }
}

export const getServerSideProps = getPageServerSideProps
