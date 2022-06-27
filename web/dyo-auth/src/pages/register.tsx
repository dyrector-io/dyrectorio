import {
  API_AUTH_REGISTER,
  ATTRIB_CSRF,
  ROUTE_SETTINGS,
  ROUTE_VERIFICATION,
} from '@app/const'
import {
  findAttributes,
  findError,
  findMessage,
  forwardCookie,
  isDyoError,
  obtainSession,
  redirectTo,
  removeError,
  upsertDyoError,
  upsertError,
} from '@app/utils'
import { SelfServiceRegistrationFlow } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { DyoErrorDto, RegisterDto } from '@server/models'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'
import { DyoButton } from '../components/dyo-button'
import DyoImage from '../components/dyo-image'
import { FormCard } from '../components/form/form-card'
import { FormHeader } from '../components/form/form-header'
import { FormMessage } from '../components/form/form-message'
import { LabeledInput } from '../components/form/labeled-input'
import { SingleFormLayout } from '../components/layout'

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
        setErrors(
          upsertError(errors, 'confirmPassword', 'CONFIRM_PASS_MISMATCH'),
        )
        return
      } else {
        setErrors(removeError(errors, 'confirmPassword'))
      }

      const captcha = await recaptcha.current.executeAsync()

      const data: RegisterDto = {
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
          toast(t('errors:INTERNAL_SERVER_ERROR'))
        }
      }
    },
  })

  const signUpWithGoogle = async () => {
    alert('google')
  }

  const signUpWithGithub = async () => {
    alert('github')
  }

  return (
    <SingleFormLayout>
      <FormCard
        submitLabel={t('createAcc')}
        onSubmit={formik.handleSubmit}
        submitWidth="w-96"
        afterForm={
          <>
            <div className="flex justify-center mt-8">
              <DyoButton secondary className="w-96" onClick={signUpWithGoogle}>
                <div className="flex justify-center items-center">
                  <DyoImage src="/google-icon.svg" width={32} height={32} />
                  <div className="ml-2">{t('signUpGoogle')}</div>
                </div>
              </DyoButton>
            </div>

            <div className="flex justify-center mt-8">
              <DyoButton secondary className="w-96" onClick={signUpWithGithub}>
                <div className="flex justify-center items-center">
                  <DyoImage src="/github-icon.svg" width={32} height={32} />
                  <div className="ml-2">{t('signUpGithub')}</div>
                </div>
              </DyoButton>
            </div>
          </>
        }
      >
        <FormHeader>{t('signUp')}</FormHeader>

        <LabeledInput
          label={t('common:email')}
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          message={findMessage(ui, 'traits.email')}
        />

        <LabeledInput
          label={t('common:password')}
          name="password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          message={findMessage(ui, 'password')}
        />

        <LabeledInput
          label={t('common:confirmPass')}
          name="confirmPassword"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.confirmPassword}
          message={findError(errors, 'confirmPassword', it =>
            t(`errors:${it.error}`),
          )}
          messageType="error"
        />

        {ui.messages?.map(it => (
          <FormMessage message={it} />
        ))}

        <FormMessage
          message={findError(errors, 'captcha', it =>
            t(`errors:${it.error}`, {
              name: it.value,
            }),
          )}
          messageType="error"
        />

        <ReCAPTCHA
          ref={recaptcha}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        />
      </FormCard>

      <div className="flex justify-center mt-8">
        <p className="font-light-gray mr-2">{t('alreadyUser')}</p>

        <Link href="/auth/login">
          <a className="font-bold underline">{t('common:logIn')}</a>
        </Link>
      </div>

      <div className="h-12" />
    </SingleFormLayout>
  )
}

export default RegisterPage

export async function getServerSideProps(context: NextPageContext) {
  const session = await obtainSession(context, kratos)
  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = await kratos.initializeSelfServiceRegistrationFlowForBrowsers()
  forwardCookie(context, flow)

  return {
    props: flow.data,
  }
}
