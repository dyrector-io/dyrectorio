import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import { ChangePassword } from '@app/models'
import { API_SETTINGS_CHANGE_PASSWORD, ROUTE_INDEX, ROUTE_LOGIN, ROUTE_LOGOUT } from '@app/routes'
import { findAttributes, findMessage, redirectTo, sendForm, withContextErrorHandling } from '@app/utils'
import { SelfServiceSettingsFlow } from '@ory/kratos-client'
import kratos, { identityHasNoPassword, obtainKratosSession } from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'

type NoPasswordPageProps = SelfServiceSettingsFlow

const NoPasswordPage = (props: NoPasswordPageProps) => {
  const { ui: propsUi, id } = props

  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(propsUi)
  const [confirmError, setConfirmError] = useState<string>(null)
  const [priviledgedSession, setPriviledgedSession] = useState(true)

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

      const data: ChangePassword = {
        flow: id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        password: values.password,
      }

      const res = await sendForm('POST', API_SETTINGS_CHANGE_PASSWORD, data)

      if (res.ok) {
        router.replace(ROUTE_INDEX)
      } else if (res.status === 403) {
        setPriviledgedSession(false)
      } else {
        const result = await res.json()
        setUi(result.ui)
      }
    },
  })

  const onLogout = () => router.push(ROUTE_LOGOUT)

  return (
    <SingleFormLayout title={t('changePass')}>
      <DyoCard className="p-8 mx-auto my-auto">
        <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('changePass')}</DyoSingleFormHeading>

          {priviledgedSession ? (
            <>
              <DyoLabel textColor="text-bright-muted mx-auto max-w-lg mt-8">{t('needToSetPassword')}</DyoLabel>

              <DyoInput
                label={t('common:password')}
                name="password"
                type="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                message={findMessage(ui, 'password')}
                grow
              />

              <DyoInput
                label={t('common:confirmPass')}
                name="confirmPassword"
                type="password"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                message={confirmError}
                messageType="error"
                grow
              />

              {ui.messages?.map((it, index) => (
                <DyoMessage key={`error-${index}`} message={it.text} />
              ))}

              <DyoButton className="mt-8" type="submit">
                {t('common:save')}
              </DyoButton>
            </>
          ) : (
            <>
              <DyoLabel textColor="text-bright-muted max-w-lg my-8">{t('noPasswordExpiredPriviledge')}</DyoLabel>

              <DyoButton onClick={onLogout}>{t('clickToLogout')}</DyoButton>
            </>
          )}
        </DyoForm>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default NoPasswordPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const session = await obtainKratosSession(context.req)
  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const hasNoPassword = identityHasNoPassword(session)
  if (!hasNoPassword) {
    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.initializeSelfServiceSettingsFlowForBrowsers(undefined, {
    headers: {
      Cookie: cookie,
    },
  })

  return {
    props: flow.data,
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
