import { SelfServiceSettingsFlow } from '@ory/kratos-client'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useState } from 'react'
import { FormCard } from '@app/components/form/form-card'
import { FormHeader } from '@app/components/form/form-header'
import { FormMessage } from '@app/components/form/form-message'
import { LabeledInput } from '@app/components/form/labeled-input'
import { Layout } from '@app/components/layout'
import {
  API_SETTINGS_CHANGE_PASSWORD,
  ATTRIB_CSRF,
  ROUTE_LOGIN,
} from '@app/const'
import kratos from '@server/kratos'
import { ChangePasswordDto } from '@server/models'
import {
  findAttributes,
  findMessage,
  obtainSessionWithCookie,
  redirectTo,
} from '@app/utils'

const SettingsPage = (props: SelfServiceSettingsFlow) => {
  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(props.ui)
  const [confirmError, setConfirmError] = useState<string>(null)

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async values => {
      if (values.password !== values.confirmPassword) {
        setConfirmError(t('errors:confirmPassMismatch'))
        return
      }

      setConfirmError(null)

      const data: ChangePasswordDto = {
        flow: props.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        password: values.password,
      }

      const res = await fetch(API_SETTINGS_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.back()
      } else if (res.status === 403) {
        router.replace(`${ROUTE_LOGIN}?refresh=${props.identity.traits.email}`)
      } else {
        const data = await res.json()
        setUi(data.ui)
      }
    },
  })

  return (
    <Layout>
      {
        <FormCard
          className="mt-24"
          submitLabel={t('save')}
          onSubmit={formik.handleSubmit}
        >
          <FormHeader>{t('changePass')}</FormHeader>

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
            message={confirmError}
            messageType="error"
          />

          {ui.messages?.map(it => (
            <FormMessage message={it} />
          ))}
        </FormCard>
      }
    </Layout>
  )
}

export default SettingsPage

export async function getServerSideProps(context: NextPageContext) {
  const [session, cookie] = await obtainSessionWithCookie(context, kratos)

  if (!session || !cookie) {
    return redirectTo(ROUTE_LOGIN)
  }

  const flow = await kratos.initializeSelfServiceSettingsFlowForBrowsers(
    undefined,
    {
      headers: {
        Cookie: cookie,
      },
    },
  )

  return {
    props: flow.data,
  }
}
