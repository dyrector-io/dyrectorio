import { Identity } from '@ory/kratos-client'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import React from 'react'
import { DyoButton } from '../components/dyo-button'
import { DyoCard } from '../components/dyo-card'
import { DyoLabel } from '../components/dyo-label'
import { FormHeader } from '../components/form/form-header'
import { Layout } from '../components/layout'
import {
  ROUTE_LOGIN,
  ROUTE_SETTINGS_CHANGE_PASSWORD,
  ROUTE_SETTINGS_EDIT_PROFILE,
  ROUTE_VERIFICATION,
} from '@app/const'
import kratos from '@server/kratos'
import { obtainSession, obtainSessionWithCookie, redirectTo } from '@app/utils'

const SettingsPage = (props: Identity) => {
  const { t } = useTranslation('settings')

  const labelClass = 'text-right mr-2 mt-2'
  const valueClass = 'mt-2'

  return (
    <Layout>
      <div className="grid grid-cols-2">
        <div className="flex justify-center mx-8">
          <DyoCard className="px-8 py-6">
            <FormHeader element="h2" className="text-2xl">
              {t('profile')}
            </FormHeader>

            <div className="flex flex-row">
              <div className="flex flex-col items-right">
                <DyoLabel className={labelClass}>{t('common:email')}</DyoLabel>
                <DyoLabel className={labelClass}>{t('firstName')}</DyoLabel>
                <DyoLabel className={labelClass}>{t('lastName')}</DyoLabel>
              </div>

              <div className="flex flex-col">
                <p className={valueClass}>{props.traits.email}</p>
                <p className={valueClass}>{props.traits.name?.first}</p>
                <p className={valueClass}>{props.traits.name?.last}</p>
              </div>
            </div>
          </DyoCard>
        </div>

        <div className="flex justify-center mx-8">
          <Link href={ROUTE_SETTINGS_EDIT_PROFILE}>
            <DyoButton>{t('editProfile')}</DyoButton>
          </Link>

          <Link href={ROUTE_SETTINGS_CHANGE_PASSWORD}>
            <DyoButton>{t('changePass')}</DyoButton>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default SettingsPage

export async function getServerSideProps(context: NextPageContext) {
  const session = await obtainSession(context, kratos)

  if (!session) {
    return redirectTo(ROUTE_LOGIN)
  }

  const identity = session.identity
  const email = identity.traits.email
  const verifiable = identity.verifiable_addresses?.filter(
    it => it.value === email && !it.verified,
  )

  if ((verifiable?.length ?? 0) > 0) {
    const address = verifiable[0]

    return redirectTo(`${ROUTE_VERIFICATION}?email=${address.value}`)
  }

  return {
    props: identity,
  }
}
