import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, KRATOS_ERROR_NO_VERIFIED_EMAIL_ADDRESS } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { DyoErrorDto, Login } from '@app/models'
import {
  API_AUTH_LOGIN,
  ROUTE_DOCS,
  ROUTE_INDEX,
  ROUTE_RECOVERY,
  ROUTE_REGISTER,
  ROUTE_VERIFICATION,
  teamInvitationUrl,
  verificationUrl,
} from '@app/routes'
import { findAttributes, findError, findMessage, isDyoError, redirectTo, sendForm, upsertDyoError } from '@app/utils'
import { LoginFlow, UiContainer } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { cookieOf, forwardCookie, obtainSessionFromRequest, userVerified } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface LoginPageProps {
  flow: LoginFlow
  recaptchaSiteKey?: string
}

const LoginPage = (props: LoginPageProps) => {
  const { t } = useTranslation('login')
  const router = useRouter()

  const { flow, recaptchaSiteKey } = props
  const invitation = router.query.invitation as string

  const email = (router.query.refresh as string) ?? ''
  const refresh = email !== ''

  const [ui, setUi] = useState(flow.ui)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const recaptcha = useRef<ReCAPTCHA>()
  const formik = useDyoFormik({
    initialValues: {
      email,
      password: '',
    },
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: Login = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: values.email,
        password: values.password,
      }

      const res = await sendForm('POST', API_AUTH_LOGIN, data)

      if (res.ok) {
        router.replace(invitation ? teamInvitationUrl(invitation) : ROUTE_INDEX)
      } else {
        recaptcha.current?.reset()
        const result = await res.json()

        if (isDyoError(result)) {
          setErrors(upsertDyoError(errors, result as DyoErrorDto))
        } else if (result?.ui) {
          const newUi = result.ui as UiContainer
          const noVerifiedEmail = newUi.messages.find(it => it.id === KRATOS_ERROR_NO_VERIFIED_EMAIL_ADDRESS)
          if (noVerifiedEmail) {
            await router.push(verificationUrl(values.email))
          }

          setUi(newUi)
        } else {
          toast(t('errors:internalError'))
        }
      }
    },
  })

  return (
    <SingleFormLayout title={t('common:logIn')}>
      <DyoSingleFormLogo />

      <DyoCard className="text-bright p-8 mt-8">
        <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('common:logIn')}</DyoSingleFormHeading>

          {!refresh ? null : <p className="w-80 mx-auto mt-8">{t('refresh')}</p>}
          {!invitation ? null : <p className="w-80 mx-auto mt-8">{t('loginToAcceptInv')}</p>}

          <DyoInput
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'identifier')}
          />

          <DyoInput
            label={t('common:password')}
            name="password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            message={findMessage(ui, 'password')}
          />

          {ui.messages?.map((it, index) => (
            <DyoMessage key={`error-${index}`} message={it?.text} />
          ))}

          <DyoMessage
            message={findError(errors, 'captcha', it =>
              t(`errors:${it.error}`, {
                name: it.value,
              }),
            )}
            messageType="error"
          />

          <DyoButton className="mt-8" type="submit">
            {t('common:logIn')}
          </DyoButton>

          {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
        </DyoForm>

        <div className="flex justify-center mt-10">
          <Link href={ROUTE_RECOVERY}>{t('forgotPassword')}</Link>
        </div>
      </DyoCard>

      <div className="flex justify-center  text-bright mt-8">
        <p className="mr-2">{t('dontHaveAnAccount')}</p>

        <Link className="font-bold underline" href={ROUTE_REGISTER}>
          {t('common:signUp')}
        </Link>
      </div>

      <div className="flex justify-center  text-bright mt-4">
        <p className="mr-2">{t('newToDyo')}</p>

        <Link className="font-bold underline" href={ROUTE_DOCS} target="_blank">
          {t('common:documentation').toLowerCase()}
        </Link>
      </div>
    </SingleFormLayout>
  )
}

export default LoginPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { refresh } = context.query
  const session = await obtainSessionFromRequest(context.req)

  if (session && !refresh) {
    if (!userVerified(session.identity)) {
      return redirectTo(ROUTE_VERIFICATION)
    }

    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.createBrowserLoginFlow({
    refresh: !!refresh,
    cookie: !refresh ? undefined : cookieOf(context.req),
  })

  forwardCookie(context, flow)

  return {
    props: {
      flow: flow.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
