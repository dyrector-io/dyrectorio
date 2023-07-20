import { SingleFormLayout } from '@app/components/layout'
import { HEADER_LOCATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoSingleFormHeading from '@app/elements/dyo-single-form-heading'
import DyoSingleFormLogo from '@app/elements/dyo-single-form-logo'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { CreateAccount, DyoErrorDto } from '@app/models'
import { API_CREATE_ACCOUNT, ROUTE_INDEX } from '@app/routes'
import { findUiMessage, isDyoError, redirectTo, sendForm, upsertDyoError, withContextErrorHandling } from '@app/utils'
import { RecoveryFlow } from '@ory/kratos-client'
import { forwardCookie } from '@server/cookie'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface AcceptInvitationPageProps {
  flow: RecoveryFlow
  code: string
  team: string
}

const AcceptInvitationPage = (props: AcceptInvitationPageProps) => {
  const { flow: propsFlow, code, team } = props

  const { t } = useTranslation('create-account')
  const router = useRouter()

  const [flow, setFlow] = useState(propsFlow)
  const [errors, setErrors] = useState<DyoErrorDto[]>([])

  const { ui } = flow

  const formik = useDyoFormik({
    initialValues: {},
    onSubmit: async () => {
      const body: CreateAccount = {
        flow: flow.id,
        code,
        team,
      }

      const res = await sendForm('POST', API_CREATE_ACCOUNT, body)
      if (res.ok) {
        router.replace(res.headers.get(HEADER_LOCATION) ?? ROUTE_INDEX)
      } else if (res.status === 410) {
        await router.reload()
      } else {
        const result = await res.json()

        if (isDyoError(result)) {
          setErrors(upsertDyoError(errors, result as DyoErrorDto))
        } else if (result?.ui) {
          setFlow(result)
        } else if (res.status === 403) {
          // can't retry the recovery flow

          router.replace(ROUTE_INDEX)
        } else {
          toast(t('errors:internalError'))
        }
      }
    },
  })

  const uiMessage = findUiMessage(ui, 'error')

  return (
    <SingleFormLayout title={t('createAccount')}>
      <DyoSingleFormLogo />

      <DyoCard className="p-8 mt-8">
        <form className="flex flex-col items-center" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoSingleFormHeading>{t('createAccount')}</DyoSingleFormHeading>

          <DyoLabel className="text-center w-80 mx-auto mt-8">{t('invitedToDyrectorio')}</DyoLabel>

          {uiMessage ? <DyoMessage message={uiMessage} messageType="error" /> : null}

          <DyoButton className="px-4 mx-auto mt-12" type="submit">
            {t('accept')}
          </DyoButton>
        </form>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default AcceptInvitationPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const flowId = context.query.flow as string
  const code = context.query.code as string
  const team = context.query.team as string

  if (!flowId || !code || !team) {
    return redirectTo(ROUTE_INDEX)
  }

  const flow = await kratos.getRecoveryFlow({
    id: flowId,
  })

  forwardCookie(context, flow)

  return {
    props: {
      flow: flow.data,
      code,
      team,
    },
  }
}

export const getServerSideProps = withContextErrorHandling(getPageServerSideProps)
