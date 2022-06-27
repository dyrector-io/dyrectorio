import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { DyoButton } from '../components/dyo-button'
import { DyoCard } from '../components/dyo-card'
import { DyoLabel } from '../components/dyo-label'
import { FormHeader } from '../components/form/form-header'
import { SingleFormLayout } from '../components/layout'
import { ROUTE_LOGIN, ROUTE_SETTINGS } from '@app/const'
import kratos, { assambleKratosRecoveryUrl } from '@server/kratos'
import { obtainSession, redirectTo } from '@app/utils'

interface InviteProps {
  url?: string
}

const InvitePage = (props: InviteProps) => {
  const { t } = useTranslation('invite')

  if (!props.url) {
    return (
      <SingleFormLayout>
        <DyoCard className="my-16 mx-auto flex flex-col items-center">
          <FormHeader>{t('expired')}</FormHeader>
          <DyoLabel>{t('pleaseContact')}</DyoLabel>
        </DyoCard>
      </SingleFormLayout>
    )
  }

  const onAccept = () => window.location.assign(props.url)

  return (
    <SingleFormLayout>
      <DyoCard className="flex flex-col items-center">
        <FormHeader>{t('welcome')}</FormHeader>

        <DyoLabel>{t('youAreInvited')}</DyoLabel>

        <p className="my-8">{t('pleaseAccept')}</p>

        <DyoButton className="px-8" onClick={onAccept}>
          {t('accept')}
        </DyoButton>
      </DyoCard>
    </SingleFormLayout>
  )
}

export default InvitePage

export async function getServerSideProps(context: NextPageContext) {
  const session = await obtainSession(context, kratos)

  if (session) {
    return redirectTo(ROUTE_SETTINGS)
  }

  const flow = context.query['flow'] as string
  const token = context.query['token'] as string
  const expired = context.query['expired']

  if (expired) {
    return {
      props: {},
    }
  }

  if (!flow || !token) {
    return redirectTo(ROUTE_LOGIN)
  }

  return {
    props: {
      url: assambleKratosRecoveryUrl(flow, token),
    },
  }
}
