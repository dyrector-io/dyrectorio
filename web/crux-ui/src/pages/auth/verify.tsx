import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, AUTH_RESEND_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTimer from '@app/hooks/use-timer'
import { DyoErrorDto, VerifyEmail } from '@app/models'
import { API_VERIFICATION, ROUTE_INDEX, ROUTE_SETTINGS } from '@app/routes'
import {
  findAttributes,
  findError,
  findMessage,
  findUiMessage,
  isDyoError,
  redirectTo,
  sendForm,
  upsertDyoError,
  withContextErrorHandling,
} from '@app/utils'
import { verifySchema } from '@app/validations'
import { VerificationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { forwardCookie, obtainSessionFromRequest, userVerified } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface VerifyProps {
  email: string
  flow: VerificationFlow
  recaptchaSiteKey?: string
}

const VerifyPage = (props: VerifyProps) => {
  const { t } = useTranslation('verify')
  const router = useRouter()

  const { flow: propsFlow, email, recaptchaSiteKey } = props

  const recaptcha = useRef<ReCAPTCHA>()
  const [flow, setFlow] = useState(propsFlow)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(-1, recaptchaSiteKey ? () => recaptcha.current.reset() : null)

  useEffect(() => {
    if (flow.state === 'passed_challenge') {
      router.push(ROUTE_INDEX)
    }
  }, [flow.state, router])

  const sent = flow.state === 'sent_email'
  const { ui } = flow

  const formik = useDyoFormik({
    initialValues: {
      email: email ?? '',
      code: '',
    },
    validationSchema: verifySchema,
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: VerifyEmail = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        captcha,
        email: !sent ? values.email : null,
        code: sent ? values.code.trim() : null,
      }

      const res = await sendForm('POST', API_VERIFICATION, data)

      if (res.ok) {
        if (!sent) {
          startCountdown(AUTH_RESEND_DELAY)
        }

        setFlow(await res.json())
      } else {
        recaptcha.current?.reset()

        const result = await res.json()

        if (isDyoError(result)) {
          setErrors(upsertDyoError(errors, result as DyoErrorDto))
        } else if (result?.ui) {
          setFlow(result)
        } else {
          toast(t('errors:internalError'))
        }
      }
    },
  })

  const resendEmail = () => {
    setFlow({
      ...flow,
      state: null,
    })

    startCountdown(AUTH_RESEND_DELAY)

    formik.submitForm()
  }

  const submitDisabled = countdown > 0

  const uiMessage = findUiMessage(ui, 'error')

  return (
    <SingleFormLayout title={t('verification')}>
      <DyoCard className="text-bright p-8 m-auto">
        <DyoSingleFormHeading className="max-w-xs">{t('verification')}</DyoSingleFormHeading>

        <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoInput
            hidden={sent}
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'email')}
          />

          {!sent ? null : (
            <>
              <p className="w-80 mx-auto mt-4">{t('codeSentToEmail', formik.values)}</p>

              <DyoInput
                label={t('common:code')}
                name="code"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.code}
                message={findMessage(ui, 'code')}
              />

              <DyoButton className="mt-8" type="submit">
                {t('verify')}
              </DyoButton>
            </>
          )}

          {!sent ? (
            <DyoButton className="mt-8" disabled={submitDisabled} type="submit">
              {t('common:send')}
            </DyoButton>
          ) : (
            <DyoButton
              className="mt-8"
              color="bg-warning-orange"
              disabled={submitDisabled}
              type="button"
              onClick={resendEmail}
            >
              {`${t('common:resend')} ${countdown > 0 ? countdown : ''}`.trim()}
            </DyoButton>
          )}
        </DyoForm>

        {uiMessage ? <DyoMessage message={uiMessage} messageType="error" /> : null}

        <DyoMessage
          message={findError(errors, 'captcha', it =>
            t(`errors:${it.error}`, {
              name: it.value,
            }),
          )}
          messageType="error"
        />

        {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
      </DyoCard>
    </SingleFormLayout>
  )
}

export default VerifyPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flow = context.query.flow as string
  const email = context.query.email ? decodeURIComponent(context.query.email as string) : null

  const session = await obtainSessionFromRequest(context.req)
  if (session && userVerified(session.identity)) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const { cookie } = context.req.headers
  const kratosRes = flow
    ? await kratos.getVerificationFlow({
        id: flow,
        cookie,
      })
    : await kratos.createBrowserVerificationFlow()

  forwardCookie(context, kratosRes)

  return {
    props: {
      email: email ?? session?.identity?.traits?.email ?? null,
      flow: kratosRes.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
