import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoMessage } from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import { DyoErrorDto, Login } from '@app/models'
import { API_AUTH_LOGIN, ROUTE_INDEX, ROUTE_RECOVERY, ROUTE_REGISTER, ROUTE_VERIFICATION } from '@app/routes'
import { findAttributes, findError, findMessage, isDyoError, redirectTo, sendForm, upsertDyoError } from '@app/utils'
import { SelfServiceLoginFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { cookieOf, forwardCookie, obtainKratosSession, userVerified } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface LoginPageProps {
  flow: SelfServiceLoginFlow
  recaptchaSiteKey?: string
}

const LoginPage = (props: LoginPageProps) => {
  const { t } = useTranslation('login')
  const router = useRouter()

  const { flow, recaptchaSiteKey } = props

  const email = (router.query.refresh as string) ?? ''
  const refresh = email !== ''

  const [ui, setUi] = useState(flow.ui)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const recaptcha = useRef<ReCAPTCHA>()
  const formik = useFormik({
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
        router.replace(ROUTE_INDEX)
      } else {
        recaptcha.current?.reset()
        const data = await res.json()

        if (isDyoError(data)) {
          setErrors(upsertDyoError(errors, data as DyoErrorDto))
        } else if (data?.ui) {
          setUi(data.ui)
        } else {
          toast(t('errors:internalError'))
        }
      }
    },
  })

  return (
    <SingleFormLayout title={t('common:logIn')}>
      <DyoSingleFormLogo />

      <DyoCard className=" text-bright p-8 mx-auto">
        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('common:logIn')}</DyoSingleFormHeading>

          {!refresh ? null : <p className="w-80 mx-auto mt-8">{t('refresh')}</p>}

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
        </form>

        <div className="flex justify-center mt-10">
          <Link href={ROUTE_RECOVERY}>
            <a>{t('forgotPassword')}</a>
          </Link>
        </div>
      </DyoCard>

      <div className="flex justify-center  text-bright mt-8 mb-auto">
        <p className="mr-2">{t('dontHaveAnAccount')}</p>

        <Link href={ROUTE_REGISTER}>
          <a className="font-bold underline">{t('common:signUp')}</a>
        </Link>
      </div>
    </SingleFormLayout>
  )
}

export default LoginPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { refresh } = context.query
  const session = await obtainKratosSession(context.req)

  if (session && !refresh) {
    if (!userVerified(session.identity)) {
      return redirectTo(ROUTE_VERIFICATION)
    }

    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.initializeSelfServiceLoginFlowForBrowsers(
    !!refresh,
    undefined,
    undefined,
    !refresh
      ? undefined
      : {
          headers: {
            Cookie: cookieOf(context.req),
          },
        },
  )

  forwardCookie(context, flow)

  return {
    props: {
      flow: flow.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
