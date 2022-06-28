import { SelfServiceSettingsFlow } from '@ory/kratos-client'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useState } from 'react'
import { FormCard } from '@app/components/form/form-card'
import { FormHeader } from '@app/components/form/form-header'
import { LabeledInput } from '@app/components/form/labeled-input'
import { Layout } from '@app/components/layout'
import { API_SETTINGS_EDIT_PROFILE, ATTRIB_CSRF, ROUTE_LOGIN } from '@app/const'
import kratos from '@server/kratos'
import { EditProfileDto } from '@server/models'
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

  const formik = useFormik({
    initialValues: {
      email: findAttributes(ui, 'traits.email').value,
      firstName: findAttributes(ui, 'traits.name.first').value,
      lastName: findAttributes(ui, 'traits.name.last').value,
    },
    onSubmit: async values => {
      const data: EditProfileDto = {
        flow: props.id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      }

      const res = await fetch(API_SETTINGS_EDIT_PROFILE, {
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
          <FormHeader>{t('editProfile')}</FormHeader>

          <LabeledInput
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'traits.email')}
          />

          <LabeledInput
            label={t('firstName')}
            name="firstName"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.firstName}
            message={findMessage(ui, 'traits.name.first')}
          />

          <LabeledInput
            label={t('lastName')}
            name="lastName"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.lastName}
            message={findMessage(ui, 'traits.name.last')}
          />
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
