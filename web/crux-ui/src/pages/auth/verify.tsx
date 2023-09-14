import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, AUTH_RESEND_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import LoadingIndicator from '@app/elements/loading-indicator'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTimer from '@app/hooks/use-timer'
import { DyoErrorDto, VerifyEmail } from '@app/models'
import { API_VERIFICATION, ROUTE_INDEX, ROUTE_LOGOUT, ROUTE_SETTINGS, verificationUrl } from '@app/routes'
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
import { verifyCodeSchema, verifyEmailSchema } from '@app/validations'
import { VerificationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import { forwardCookie } from '@server/cookie'
import kratos, { obtainSessionFromRequest, verifiableEmailOfIdentity } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface VerifyProps {
  email: string
  flow?: VerificationFlow
  recaptchaSiteKey?: string
}

const VerifyPage = (props: VerifyProps) => {
  const { t } = useTranslation('verify')
  const router = useRouter()

  const { flow: propsFlow, email, recaptchaSiteKey } = props

  const recaptcha = useRef<ReCAPTCHA>()
  const [flow, setFlow] = useState(propsFlow)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])
  const [countdown, startCountdown] = useTimer(-1, recaptchaSiteKey ? () => recaptcha.current?.reset() : null)

  const implictEmailSent = !flow
  const flowEmailSent = flow?.state === 'sent_email'

  const passedChallenge = flow?.state === 'passed_challenge'

  useEffect(() => {
    if (passedChallenge) {
      router.push(ROUTE_INDEX)
    }
  }, [passedChallenge, router])

  const ui = flow?.ui

  const submitFlow = async (flowEmail: string, flowCode: string) => {
    const captcha = await recaptcha.current?.executeAsync()

    const data: VerifyEmail = {
      flow: flow.id,
      csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
      captcha,
      email: flowEmail,
      code: flowCode,
    }

    const res = await sendForm('POST', API_VERIFICATION, data)

    if (res.ok) {
      if (!flowEmailSent) {
        startCountdown(AUTH_RESEND_DELAY)
      }

      setFlow(await res.json())
    } else if (res.status === 410) {
      await router.reload()
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
  }

  const formik = useDyoFormik({
    initialValues: {
      email: !flowEmailSent ? email ?? '' : null,
      code: flowEmailSent ? findAttributes(ui, 'code')?.value ?? '' : null,
    },
    validationSchema: !flowEmailSent ? verifyEmailSchema : verifyCodeSchema,
    t,
    onSubmit: async values =>
      submitFlow(!flowEmailSent ? values.email : null, flowEmailSent ? values.code.trim() : null),
  })

  const resendEmail = async () => {
    startCountdown(AUTH_RESEND_DELAY)

    submitFlow(formik.values.email ?? email, null)
  }

  const restartVerification = () => {
    window.location.replace(verificationUrl({ email, restart: true }))
  }

  const emailAvailable = !!formik.values.email
  const submitDisabled = countdown > 0

  const uiMessage = ui ? findUiMessage(ui, 'error') : null

  const restartVerificationButton = (
    <DyoButton className="mt-8" secondary onClick={restartVerification}>
      {t('restartVerification')}
    </DyoButton>
  )

  return (
    <SingleFormLayout title={t('verification')}>
      {passedChallenge ? (
        <LoadingIndicator />
      ) : (
        <div>
          <DyoCard className="text-bright p-8 m-auto">
            <DyoSingleFormHeading className="max-w-xs">{t('verification')}</DyoSingleFormHeading>

            {implictEmailSent ? (
              <div className="flex flex-col w-80 mx-auto text-center">
                <p className="mt-4">{t('emailWasSent', formik.values)}</p>
                <p className="mt-4">{t('ifYouCantFind')}</p>

                {restartVerificationButton}
              </div>
            ) : (
              <>
                <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
                  {flowEmailSent ? null : (
                    <DyoInput
                      label={t('common:email')}
                      name="email"
                      type="email"
                      onChange={formik.handleChange}
                      value={formik.values.email}
                      message={findMessage(ui, 'email')}
                    />
                  )}

                  {!flowEmailSent ? null : (
                    <>
                      {formik.values.email ? (
                        <p className="w-80 text-center mx-auto mt-4">{t('codeSentToEmail', formik.values)}</p>
                      ) : (
                        <p className="w-80 text-center mx-auto mt-4">{t('pleaseClickVerify')}</p>
                      )}

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

                  {!flowEmailSent ? (
                    <DyoButton className="mt-8" disabled={submitDisabled} type="submit">
                      {t('common:send')}
                    </DyoButton>
                  ) : emailAvailable ? (
                    <DyoButton
                      className="mt-8"
                      color="bg-warning-orange"
                      disabled={submitDisabled}
                      type="button"
                      onClick={resendEmail}
                    >
                      {`${t('common:resend')} ${countdown > 0 ? countdown : ''}`.trim()}
                    </DyoButton>
                  ) : (
                    restartVerificationButton
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
              </>
            )}
            {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
          </DyoCard>
          <div className="flex justify-center text-bright mt-8">
            <Link className="font-bold underline" href={ROUTE_LOGOUT}>
              {t('common:logOut')}
            </Link>
          </div>
        </div>
      )}
    </SingleFormLayout>
  )
}

export default VerifyPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flow = context.query.flow as string
  const restart = context.query.restart === 'true'

  const queryEmail = context.query.email ? decodeURIComponent(context.query.email as string) : null

  let email: string | null = queryEmail
  let sent = false

  if (!flow && !restart) {
    const session = await obtainSessionFromRequest(context.req)

    if (session) {
      const verifiableEmail = verifiableEmailOfIdentity(session.identity)
      if (!verifiableEmail || verifiableEmail.verified) {
        return redirectTo(ROUTE_SETTINGS)
      }

      sent = verifiableEmail.status === 'sent'
      if (!queryEmail) {
        email = session.identity.traits.email ?? null
      }
    }
  } else if (!queryEmail) {
    const session = await obtainSessionFromRequest(context.req)

    if (session) {
      email = session.identity.traits.email ?? null
    }
  }

  const recaptchaSiteKey = captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY
  if (sent) {
    return {
      props: {
        email,
        recaptchaSiteKey,
      },
    }
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
      email,
      flow: kratosRes.data,
      recaptchaSiteKey,
    },
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
