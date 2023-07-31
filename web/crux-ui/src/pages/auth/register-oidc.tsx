import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, ATTRIB_OIDC_PROVIDER, HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { DyoErrorDto, Register } from '@app/models'
import { API_AUTH_REGISTER, ROUTE_LOGIN, ROUTE_LOGOUT, ROUTE_SETTINGS } from '@app/routes'
import { findAttributes, findError, findMessage, isDyoError, redirectTo, upsertDyoError } from '@app/utils'
import { registerSchema } from '@app/validations'
import { RegistrationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { cookieOf, forwardCookie, obtainSessionFromRequest } from '@server/kratos'
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

const RegisterOidcPage = (props: RegisterPageProps) => {
  const { t } = useTranslation('register')
  const router = useRouter()

  const { flow, recaptchaSiteKey } = props

  const [ui, setUi] = useState(flow.ui)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const recaptcha = useRef<ReCAPTCHA>()

  const formik = useDyoFormik({
    initialValues: {
      email: (findAttributes(ui, 'traits.email')?.value as string) ?? '',
      firstName: (findAttributes(ui, 'traits.name.first')?.value as string) ?? '',
      lastName: (findAttributes(ui, 'traits.name.last')?.value as string) ?? '',
    },
    validationSchema: registerSchema,
    onSubmit: async values => {
      const captcha = await recaptcha.current?.executeAsync()

      const data: Register = {
        method: 'oidc',
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        provider: findAttributes(ui, ATTRIB_OIDC_PROVIDER)?.value,
        email: values.email,
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
        window.location.href = res.headers.get(HEADER_LOCATION)
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
              containerClassName="col-span-2"
              grow
              label={t('common:email')}
              name="email"
              type="email"
              disabled
              value={formik.values.email}
              message={formik.errors.email ?? findMessage(ui, 'traits.email')}
            />

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
            {t('continue')}
          </DyoButton>

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
        <Link className="font-bold underline" href={ROUTE_LOGOUT}>
          {t('common:logOut')}
        </Link>
      </div>
    </SingleFormLayout>
  )
}

export default RegisterOidcPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flowId = context.query.flow as string

  const session = await obtainSessionFromRequest(context.req)
  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  if (!flowId) {
    return redirectTo(ROUTE_LOGIN)
  }

  const flow = await kratos.getRegistrationFlow({
    id: flowId,
    cookie: cookieOf(context.req),
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
