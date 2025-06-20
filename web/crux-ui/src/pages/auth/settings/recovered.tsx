import { SingleFormLayout } from '@app/components/layout'
import { ATTRIB_CSRF, HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoPassword from '@app/elements/dyo-password'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { ChangePassword, oidcEnabled, OidcProvider } from '@app/models'
import { API_SETTINGS_CHANGE_PASSWORD, API_SETTINGS_OIDC, ROUTE_INDEX, ROUTE_LOGIN, ROUTE_LOGOUT } from '@app/routes'
import {
  findAttributes,
  findMessage,
  mapOidcAvailability,
  passwordMethodAvilable,
  redirectTo,
  sendForm,
  withContextErrorHandling,
} from '@app/utils'
import { passwordSchema } from '@app/validations'
import { SettingsFlow } from '@ory/kratos-client'
import { forwardCookie } from '@server/cookie'
import kratos, { identityRecoverySuccess, identityWasRecovered, obtainSessionFromRequest } from '@server/kratos'
import { GetServerSidePropsContext } from 'next'
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

  const oidc = mapOidcAvailability(ui)
  const passwordAvailable = passwordMethodAvilable(ui)

  const handleApiError = defaultApiErrorHandler(t)

  const connectWithOidc = async (provider: OidcProvider) => {
    const res = await sendForm('POST', API_SETTINGS_OIDC, {
      flow: id,
      provider,
    })

    if (!res.ok) {
      if (res.status === 403) {
        await router.replace(ROUTE_LOGOUT)
        return
      }

      if (res.status === 410) {
        router.reload()
        return
      }

      await handleApiError(res)
      return
    }

    if (res.status === 201) {
      const url = res.headers.get(HEADER_LOCATION)
      await router.push(url)
      return
    }

    const newFlow = (await res.json()) as SettingsFlow
    setUi(newFlow.ui)
  }

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
        await router.replace(ROUTE_INDEX)
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

  const title = t(passwordAvailable ? 'changePass' : 'connect')

  return (
    <SingleFormLayout title={title}>
      <DyoCard className="flex flex-col p-8 mx-auto my-auto">
        <DyoSingleFormHeading>{title}</DyoSingleFormHeading>

        {passwordAvailable && (
          <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
            {priviledgedSession ? (
              <>
                <DyoLabel textColor="text-bright-muted mx-auto max-w-lg mt-8">{t('needToSetPassword')}</DyoLabel>

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
        )}

        {oidcEnabled(oidc) && (
          <div className="flex flex-col gap-4 items-center mx-auto mt-4">
            <span className="text-light">{t(passwordAvailable ? 'orConnectWith' : 'connectYourAccount')}</span>

            <div className="flex flex-row gap-8">
              {oidc.gitlab && (
                <DyoIcon src="/oidc/gitlab.svg" size="lg" alt="Gitlab" onClick={() => connectWithOidc('gitlab')} />
              )}

              {oidc.github && (
                <DyoIcon src="/oidc/github.svg" size="lg" alt="Github" onClick={() => connectWithOidc('github')} />
              )}

              {oidc.google && (
                <DyoIcon src="/oidc/google.svg" size="lg" alt="Google" onClick={() => connectWithOidc('google')} />
              )}

              {oidc.azure && (
                <DyoIcon src="/oidc/azure.svg" size="lg" alt="Azure" onClick={() => connectWithOidc('azure')} />
              )}
            </div>
          </div>
        )}
      </DyoCard>
    </SingleFormLayout>
  )
}

export default NewPasswordPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
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

  if (flow.data.state === 'success') {
    await identityRecoverySuccess(session)
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: flow.data,
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
