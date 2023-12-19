import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { SaveDiscardPageMenu } from '@app/components/shared/page-menu'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoPassword from '@app/elements/dyo-password'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useSubmit from '@app/hooks/use-submit'
import { ChangePassword } from '@app/models'
import { appendTeamSlug } from '@app/providers/team-routes'
import {
  API_SETTINGS_CHANGE_PASSWORD,
  ROUTE_INDEX,
  ROUTE_LOGIN,
  ROUTE_SETTINGS,
  ROUTE_SETTINGS_CHANGE_PASSWORD,
} from '@app/routes'
import {
  findAttributes,
  findMessage,
  redirectTo,
  sendForm,
  teamSlugOrFirstTeam,
  withContextAuthorization,
} from '@app/utils'
import { passwordSchema } from '@app/validations'
import { SettingsFlow } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'

const SettingsPage = (props: SettingsFlow) => {
  const { ui: propsUi, id, identity } = props

  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(propsUi)
  const [confirmError, setConfirmError] = useState<string>(null)
  const submit = useSubmit()

  const onDiscard = () => router.replace(ROUTE_SETTINGS)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    t,
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
        await router.replace(ROUTE_SETTINGS)
      } else if (res.status === 410) {
        await router.reload()
      } else if (res.status === 403) {
        await router.replace(`${ROUTE_LOGIN}?refresh=${encodeURIComponent(identity.traits.email)}`)
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

  return (
    <Layout title={t('changePass')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <SaveDiscardPageMenu submit={submit} onDiscard={onDiscard} />
      </PageHeading>

      <DyoCard className="text-bright p-8">
        <DyoForm className="flex flex-col w-1/2" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoHeading element="h2" className="text-2xl">
            {t('changePass')}
          </DyoHeading>

          <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

          <DyoPassword
            label={t('common:password')}
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
            message={findMessage(ui, 'password') ?? formik.errors.password}
            grow
          />

          <DyoPassword
            label={t('common:confirmPass')}
            name="confirmPassword"
            onChange={formik.handleChange}
            value={formik.values.confirmPassword}
            message={confirmError ?? formik.errors.confirmPassword}
            messageType="error"
            grow
          />

          {ui.messages?.map((it, index) => <DyoMessage key={`error-${index}`} message={it.text} />)}

          <DyoButton className="hidden" type="submit" />
        </DyoForm>
      </DyoCard>
    </Layout>
  )
}

export default SettingsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const { cookie } = context.req.headers

  const flow = await kratos.createBrowserSettingsFlow({
    cookie,
  })

  const teamSlug = await teamSlugOrFirstTeam(context)
  if (!teamSlug) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: appendTeamSlug(teamSlug, flow.data),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
