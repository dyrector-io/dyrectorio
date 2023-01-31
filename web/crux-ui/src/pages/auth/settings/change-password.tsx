import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { SaveDiscardPageMenu } from '@app/components/shared/page-menu'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { ChangePassword } from '@app/models'
import { API_SETTINGS_CHANGE_PASSWORD, ROUTE_LOGIN, ROUTE_SETTINGS, ROUTE_SETTINGS_CHANGE_PASSWORD } from '@app/routes'
import { findAttributes, findMessage, sendForm, withContextAuthorization } from '@app/utils'
import { passwordSchema } from '@app/validations'
import { SettingsFlow } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

const SettingsPage = (props: SettingsFlow) => {
  const { ui: propsUi, id, identity } = props

  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(propsUi)
  const [confirmError, setConfirmError] = useState<string>(null)
  const saveRef = useRef<() => Promise<any>>()

  const formik = useDyoFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async values => {
      if (values.password !== values.confirmPassword) {
        setConfirmError(t('errors:confirmPassMismatch'))
        return
      }

      setConfirmError(null)

      const data: ChangePassword = {
        flow: id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        password: values.password,
      }

      const res = await sendForm('POST', API_SETTINGS_CHANGE_PASSWORD, data)

      if (res.ok) {
        router.back()
      } else if (res.status === 403) {
        router.replace(`${ROUTE_LOGIN}?refresh=${identity.traits.email}`)
      } else {
        const result = await res.json()
        setUi(result.ui)
      }
    },
  })

  const pageLink: BreadcrumbLink = {
    name: t('common:profile'),
    url: ROUTE_SETTINGS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: t('changePass'),
      url: ROUTE_SETTINGS_CHANGE_PASSWORD,
    },
  ]

  saveRef.current = formik.submitForm

  return (
    <Layout title={t('changePass')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <SaveDiscardPageMenu saveRef={saveRef} onDiscard={router.back} />
      </PageHeading>

      <DyoCard className="text-bright p-8">
        <DyoForm className="flex flex-col w-1/2" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoHeading element="h2" className="text-2xl">
            {t('changePass')}
          </DyoHeading>

          <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>
          <DyoInput
            label={t('common:password')}
            name="password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            message={findMessage(ui, 'password') ?? formik.errors.password}
            grow
          />

          <DyoInput
            label={t('common:confirmPass')}
            name="confirmPassword"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            message={confirmError ?? formik.errors.confirmPassword}
            messageType="error"
            grow
          />

          {ui.messages?.map((it, index) => (
            <DyoMessage key={`error-${index}`} message={it.text} />
          ))}

          <DyoButton className="hidden" type="submit" />
        </DyoForm>
      </DyoCard>
    </Layout>
  )
}

export default SettingsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const flow = await kratos.createBrowserSettingsFlow({
    cookie,
  })

  return {
    props: flow.data,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
