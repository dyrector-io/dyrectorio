import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoMessage } from '@app/elements/dyo-message'
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
import { SelfServiceRegistrationFlow } from '@ory/kratos-client'
import kratos, { forwardCookie, obtainKratosSession } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

const RegisterPage = (props: SelfServiceRegistrationFlow) => {
  const { t } = useTranslation('register')
  const router = useRouter()

  const flow = props

  const [ui, setUi] = useState(flow.ui)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const recaptcha = useRef<ReCAPTCHA>()
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async values => {
      if (values.password !== values.confirmPassword) {
        setErrors(upsertError(errors, 'confirmPassword', 'confirmPassMismatch'))
        return
      }

      setErrors(removeError(errors, 'confirmPassword'))

      const captcha = await recaptcha.current.executeAsync()

      const data: Register = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: values.email,
        password: values.password,
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
        recaptcha.current.reset()

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
    <SingleFormLayout title={t('signUp')}>
      <DyoSingleFormLogo />

      <DyoCard className="p-8 mx-auto">
        <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('signUp')}</DyoSingleFormHeading>

          <DyoInput
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'traits.email')}
          />

          <DyoInput
            label={t('common:password')}
            name="password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            message={findMessage(ui, 'password')}
          />

          <DyoInput
            label={t('common:confirmPass')}
            name="confirmPassword"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            message={findError(errors, 'confirmPassword', it => t(`errors:${it.error}`))}
            messageType="error"
          />

          {ui.messages?.map((it, index) => (
            <DyoMessage key={`error-${index}`} message={it.text} />
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
            {t('createAcc')}
          </DyoButton>

          <ReCAPTCHA ref={recaptcha} size="invisible" sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} />
        </form>
      </DyoCard>

      <div className="flex justify-center text-bright mt-8 mb-auto">
        <p className="mr-2">{t('alreadyUser')}</p>

        <Link href={ROUTE_LOGIN}>
          <a className="font-bold underline">{t('common:logIn')}</a>
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

  const flow = await kratos.initializeSelfServiceRegistrationFlowForBrowsers()
  forwardCookie(context, flow)

  return {
    props: flow.data,
  }
}

export const getServerSideProps = getPageServerSideProps
