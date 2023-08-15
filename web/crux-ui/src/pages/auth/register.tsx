import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { DyoErrorDto, oidcEnabled, OidcProvider, Register } from '@app/models'
import { API_AUTH_REGISTER, registerOidcUrl, ROUTE_LOGIN, ROUTE_SETTINGS, verificationUrl } from '@app/routes'
import {
  findAttributes,
  findError,
  findMessage,
  isDyoError,
  mapOidcAvailability,
  redirectTo,
  removeError,
  sendForm,
  upsertDyoError,
  upsertError,
} from '@app/utils'
import { registerWithPasswordSchema } from '@app/validations'
import { RegistrationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import { cookieOf, forwardCookie } from '@server/cookie'
import kratos, { obtainSessionFromRequest, registrationOidcInvalid } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

interface RegisterPageProps {
  flow: RegistrationFlow
  recaptchaSiteKey?: string
}

const RegisterPage = (props: RegisterPageProps) => {
  const { t } = useTranslation('register')
  const router = useRouter()

  const { flow, recaptchaSiteKey } = props

  const [ui, setUi] = useState(flow.ui)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const recaptcha = useRef<ReCAPTCHA>()
  const oidc = mapOidcAvailability(ui)

  const registerWithOidc = async (provider: OidcProvider) => {
    const captcha = await recaptcha.current?.executeAsync()

    const data: Register = {
      method: 'oidc',
      flow: flow.id,
      csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
      captcha,
      provider,
    }

    const res = await sendForm('POST', API_AUTH_REGISTER, data)
    if (res.ok) {
      const url = res.headers.get(HEADER_LOCATION)
      await router.push(url)
      return
    }

    if (res.status === 410) {
      await router.reload()
    }

    const result = await res.json()

    if (isDyoError(result)) {
      setErrors(upsertDyoError(errors, result as DyoErrorDto))
    } else if (result?.ui) {
      setUi(result.ui)
    } else {
      toast(t('errors:internalError'))
    }
  }

  const formik = useDyoFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      method: 'password',
    },
    validationSchema: registerWithPasswordSchema,
    onSubmit: async values => {
      if (values.password !== values.confirmPassword) {
        setErrors(upsertError(errors, 'confirmPassword', 'confirmPassMismatch'))
        return
      }

      setErrors(removeError(errors, 'confirmPassword'))

      const captcha = await recaptcha.current?.executeAsync()

      const data: Register = {
        method: 'password',
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      }

      const res = await fetch(API_AUTH_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.replace(verificationUrl({ email: values.email }))
      } else if (res.status === 410) {
        await router.reload()
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

  return (
    <SingleFormLayout title={t('common:signUp')}>
      <DyoSingleFormLogo />

      <DyoCard className="p-6 mt-2">
        <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('common:signUp')}</DyoSingleFormHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <DyoInput
              label={t('common:firstName')}
              name="firstName"
              onChange={formik.handleChange}
              value={formik.values.firstName}
              message={formik.errors.firstName}
              messageType="error"
            />

            <DyoInput
              label={t('common:lastName')}
              name="lastName"
              onChange={formik.handleChange}
              value={formik.values.lastName}
              message={formik.errors.lastName}
              messageType="error"
            />

            <DyoInput
              containerClassName="col-span-2"
              grow
              label={t('common:email')}
              name="email"
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              message={formik.errors.email ?? findMessage(ui, 'traits.email')}
            />

            <DyoInput
              label={t('common:password')}
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
            />

            <DyoInput
              label={t('common:confirmPass')}
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
            />

            <DyoMessage
              message={formik.errors.password ? formik.errors.password : findMessage(ui, 'password')}
              messageType="error"
            />

            <DyoMessage
              message={
                formik.errors.confirmPassword ?? findError(errors, 'confirmPassword', it => t(`errors:${it.error}`))
              }
              messageType="error"
            />
          </div>

          {ui.messages?.map((it, index) => (
            <DyoMessage className="text-xs italic max-w-xl mt-2" key={`error-${index}`} message={it.text} />
          ))}

          <DyoMessage
            className="text-xs italic max-w-xl mt-2"
            message={findError(errors, 'captcha', it =>
              t(`errors:${it.error}`, {
                name: it.value,
              }),
            )}
            messageType="error"
          />

          <DyoButton className="px-8 mx-auto mt-8" type="submit">
            {t('createAcc')}
          </DyoButton>

          {oidcEnabled(oidc) && (
            <div className="flex flex-col gap-2 items-center mx-auto mt-2">
              <span className="text-light my-2">{t('orSignUpWith')}</span>

              <div className="flex flex-row gap-8">
                {oidc.gitlab && (
                  <DyoIcon src="/oidc/gitlab.svg" size="lg" alt="Gitlab" onClick={() => registerWithOidc('gitlab')} />
                )}

                {oidc.github && (
                  <DyoIcon src="/oidc/github.svg" size="lg" alt="Github" onClick={() => registerWithOidc('github')} />
                )}

                {oidc.google && (
                  <DyoIcon src="/oidc/google.svg" size="lg" alt="Google" onClick={() => registerWithOidc('google')} />
                )}

                {oidc.azure && (
                  <DyoIcon src="/oidc/azure.svg" size="lg" alt="Azure" onClick={() => registerWithOidc('azure')} />
                )}
              </div>
            </div>
          )}

          <p className="text-bright text-center self-center max-w-xl mt-8">
            {t(`whenYouRegister`)}
            <a className="font-bold" href="https://dyrectorio.com/privacy" target="_blank" rel="noreferrer">
              {t('privacyPolicy')}
            </a>
            .
          </p>

          {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
        </DyoForm>
      </DyoCard>

      <div className="flex justify-center text-bright mt-8">
        <p className="mr-2">{t('alreadyUser')}</p>

        <Link className="font-bold underline" href={ROUTE_LOGIN}>
          {t('common:logIn')}
        </Link>
      </div>
    </SingleFormLayout>
  )
}

export default RegisterPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flowId = context.query.flow as string

  const session = await obtainSessionFromRequest(context.req)
  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = flowId
    ? await kratos.getRegistrationFlow({
        id: flowId,
        cookie: cookieOf(context.req),
      })
    : await kratos.createBrowserRegistrationFlow()

  if (flowId && registrationOidcInvalid(flow.data)) {
    return redirectTo(registerOidcUrl(flowId))
  }

  forwardCookie(context, flow)

  return {
    props: {
      flow: flow.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
