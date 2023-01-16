import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, AUTH_RESEND_DELAY, HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import useTimer from '@app/hooks/use-timer'
import { DyoErrorDto, RecoverEmail } from '@app/models'
import { API_RECOVERY, ROUTE_INDEX, ROUTE_RECOVERY, ROUTE_RECOVERY_EXPIRED } from '@app/routes'
import {
  findAttributes,
  findError,
  findMessage,
  findUiMessage,
  isDyoError,
  redirectTo,
  sendForm,
  upsertDyoError,
} from '@app/utils'
import { RecoveryFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { forwardCookie, obtainSessionFromRequest } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
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

  const { flow: propsFlow, recaptchaSiteKey } = props

  const recaptcha = useRef<ReCAPTCHA>()

  const [flow, setFlow] = useState(propsFlow)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const { ui } = flow

  const sent = flow.state === 'sent_email'
  const [countdown, startCountdown] = useTimer(sent ? AUTH_RESEND_DELAY : -1, () =>
    recaptchaSiteKey ? recaptcha.current.reset() : null,
  )

  const formik = useFormik({
    initialValues: {
      email: '',
      code: '',
    },
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: RecoverEmail = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: !sent ? values.email : null,
        code: sent ? values.code : null,
      }

      const res = await sendForm('POST', API_RECOVERY, data)
      if (res.ok) {
        if (res.status === 201) {
          router.push(res.headers.get(HEADER_LOCATION))
        } else {
          if (!sent) {
            startCountdown(AUTH_RESEND_DELAY)
          }

          setFlow(await res.json())
        }
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
    <SingleFormLayout title={t('recovery')}>
      <DyoCard className="text-bright p-8 m-auto">
        <DyoSingleFormHeading>{t('recovery')}</DyoSingleFormHeading>

        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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
                {t('recover')}
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
        </form>

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

export default RecoveryPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const session = await obtainSessionFromRequest(context.req)

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
