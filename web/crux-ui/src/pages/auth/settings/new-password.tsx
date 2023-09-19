import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { ChangePassword } from '@app/models'
import { API_SETTINGS_CHANGE_PASSWORD, ROUTE_INDEX, ROUTE_LOGIN, ROUTE_LOGOUT } from '@app/routes'
import { findAttributes, findMessage, redirectTo, sendForm, withContextErrorHandling } from '@app/utils'
import { passwordSchema } from '@app/validations'
import { SettingsFlow } from '@ory/kratos-client'
import { forwardCookie } from '@server/cookie'
import kratos, { identityWasRecovered, obtainSessionFromRequest } from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'

type NewPasswordPageProps = SettingsFlow

const NewPasswordPage = (props: NewPasswordPageProps) => {
  const { ui: propsUi, id } = props

  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(propsUi)
  const [confirmError, setConfirmError] = useState<string>(null)
  const [priviledgedSession, setPriviledgedSession] = useState(true)

  const formik = useDyoFormik({
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
        router.replace(ROUTE_INDEX)
      } else if (res.status === 410) {
        await router.reload()
      } else if (res.status === 403) {
        setPriviledgedSession(false)
      } else {
        const result = await res.json()
        setUi(result.ui)
      }
    },
  })

  const onLogout = async () => await router.push(ROUTE_LOGOUT)

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
                message={findMessage(ui, 'password') ?? formik.errors.password}
                grow
              />

              <DyoInput
                label={t('common:confirmPass')}
                name="confirmPassword"
                type="password"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword ?? formik.errors.confirmPassword}
                message={confirmError}
                messageType="error"
                grow
              />

              {ui.messages?.map((it, index) => <DyoMessage key={`error-${index}`} message={it.text} />)}

              <DyoButton className="mt-8" type="submit">
                {t('common:save')}
              </DyoButton>
            </>
          ) : (
            <>
              <DyoLabel textColor="text-bright-muted max-w-lg my-8">{t('newPasswordExpiredPriviledge')}</DyoLabel>

              <DyoButton onClick={onLogout}>{t('clickToLogout')}</DyoButton>
            </>
          )}
        </DyoForm>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default NewPasswordPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const session = await obtainSessionFromRequest(context.req)
  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const recovered = identityWasRecovered(session)
  if (!recovered) {
    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.getSettingsFlow({
    id: recovered,
    cookie,
  })
  forwardCookie(context, flow)

  return {
    props: flow.data,
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
