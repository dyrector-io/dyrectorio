import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import { DyoErrorDto, Register } from '@app/models'
import { API_AUTH_REGISTER, ROUTE_LOGIN, ROUTE_SETTINGS, ROUTE_VERIFICATION } from '@app/routes'
import {
  findAttributes,
  findError,
  findMessage,
  isDyoError,
  redirectTo,
  removeError,
  upsertDyoError,
  upsertError,
} from '@app/utils'
import { registerSchema } from '@app/validations'
import { RegistrationFlow } from '@ory/kratos-client'
import { captchaDisabled } from '@server/captcha'
import kratos, { forwardCookie, obtainKratosSession } from '@server/kratos'
import { useFormik } from 'formik'
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
  const formik = useFormik({
    validationSchema: registerSchema,
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    onSubmit: async values => {
      if (values.password !== values.confirmPassword) {
        setErrors(upsertError(errors, 'confirmPassword', 'confirmPassMismatch'))
        return
      }

      setErrors(removeError(errors, 'confirmPassword'))

      const captcha = await recaptcha.current?.executeAsync()

      const data: Register = {
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
        router.replace(`${ROUTE_VERIFICATION}/?email=${values.email}`)
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
    <SingleFormLayout title={t('signUp')}>
      <DyoSingleFormLogo />

      <DyoCard className="p-8 mx-auto">
        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('signUp')}</DyoSingleFormHeading>

          <div className="grid grid-cols-2 gap-x-4">
            <DyoInput
              containerClassName="order-1"
              label={t('common:email')}
              name="email"
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              message={formik.errors.email ?? findMessage(ui, 'traits.email')}
            />

            <DyoInput
              containerClassName="order-3"
              label={t('common:password')}
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              message={formik.errors.password ?? findMessage(ui, 'password')}
            />

            <DyoInput
              containerClassName="order-5"
              label={t('common:confirmPass')}
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              message={
                formik.errors.confirmPassword ?? findError(errors, 'confirmPassword', it => t(`errors:${it.error}`))
              }
              messageType="error"
            />

            <DyoInput
              containerClassName="order-2"
              label={t('common:firstName')}
              name="firstName"
              onChange={formik.handleChange}
              value={formik.values.firstName}
              message={formik.errors.firstName}
              messageType="error"
            />

            <DyoInput
              containerClassName="order-4"
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

          <DyoButton className="mx-40 mt-8" type="submit">
            {t('createAcc')}
          </DyoButton>

          {recaptchaSiteKey ? <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={recaptchaSiteKey} /> : null}
        </form>
      </DyoCard>

      <div className="flex justify-center text-bright mt-8 mb-auto">
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
  const session = await obtainKratosSession(context.req)
  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = await kratos.createBrowserRegistrationFlow()
  forwardCookie(context, flow)

  return {
    props: {
      flow: flow.data,
      recaptchaSiteKey: captchaDisabled() ? null : process.env.RECAPTCHA_SITE_KEY,
    },
  }
}

export const getServerSideProps = getPageServerSideProps
