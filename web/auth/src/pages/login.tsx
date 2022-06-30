import {
  API_AUTH_LOGIN,
  ATTRIB_CSRF,
  ROUTE_INDEX,
  ROUTE_RECOVERY,
  ROUTE_REGISTER,
  ROUTE_VERIFICATION,
} from '@app/const'
import {
  findAttributes,
  findError,
  findMessage,
  forwardCookie,
  isDyoError,
  obtainSessionWithCookie,
  redirectTo,
  upsertDyoError,
  userVerified,
} from '@app/utils'
import { SelfServiceLoginFlow } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { DyoErrorDto, LoginDto } from '@server/models'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'
import { FormCard } from '../components/form/form-card'
import { FormHeader } from '../components/form/form-header'
import { FormMessage } from '../components/form/form-message'
import { LabeledInput } from '../components/form/labeled-input'
import { SingleFormLayout } from '../components/layout'

const LoginPage = (props: SelfServiceLoginFlow) => {
  const { t } = useTranslation('login')
  const router = useRouter()

  const flow = props

  const email = (router.query['refresh'] as string) ?? ''
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
      const captcha = await recaptcha.current.executeAsync()

      const data: LoginDto = {
        flow: flow.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF)?.value,
        captcha,
        email: values.email,
        password: values.password,
      }

      const res = await fetch(API_AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.replace(ROUTE_INDEX)
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

  return (
    <SingleFormLayout>
      <FormCard
        submitLabel={t('common:logIn')}
        onSubmit={formik.handleSubmit}
        afterForm={
          <div className="flex justify-center mt-12">
            <Link href={ROUTE_RECOVERY}>
              <a className="font-light-gray">{t('forgotPassword')}</a>
            </Link>
          </div>
        }
      >
        <FormHeader>{t('common:logIn')}</FormHeader>

        {!refresh ? null : (
          <div className="flex justify-center">
            <p>{t('refresh')}</p>
          </div>
        )}

        <LabeledInput
          label={t('common:email')}
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
          message={findMessage(ui, 'identifier')}
        />

        <LabeledInput
          label={t('common:password')}
          name="password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          message={findMessage(ui, 'password')}
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
        <p className="font-light-gray mr-2">{t('dontHaveAnAccount')}</p>

        <Link href={ROUTE_REGISTER}>
          <a className="font-bold underline">{t('common:signUp')}</a>
        </Link>
      </div>
    </SingleFormLayout>
  )
}

export default LoginPage

export async function getServerSideProps(context: NextPageContext) {
  const { refresh } = context.query

  const [session, cookie] = await obtainSessionWithCookie(context, kratos)

  if (cookie && session && !refresh) {
    if (!userVerified(session.identity)) {
      return redirectTo(ROUTE_VERIFICATION)
    }

    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.initializeSelfServiceLoginFlowForBrowsers(!!refresh)
  forwardCookie(context, flow)

  return {
    props: flow.data,
  }
}
