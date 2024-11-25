import ConfigBundleCard from '@app/components/config-bundles/config-bundle-card'
import EditConfigBundleCard from '@app/components/config-bundles/edit-config-bundle-card'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { defaultApiErrorHandler } from '@app/errors'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundleDetails, detailsToConfigBundle } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

type ConfigBundleDetailsPageProps = {
  configBundle: ConfigBundleDetails
}

const ConfigBundleDetailsPage = (props: ConfigBundleDetailsPageProps) => {
  const { configBundle: propsConfigBundle } = props

  const { t } = useTranslation('config-bundles')
  const router = useRouter()
  const routes = useTeamRoutes()

  const onApiError = defaultApiErrorHandler(t)

  const [configBundle, setConfigBundle] = useState<ConfigBundleDetails>(propsConfigBundle)
  const [editing, setEditing] = useState(false)

  const submit = useSubmit()

  const onDelete = async () => {
    const res = await fetch(routes.configBundle.api.details(configBundle.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.configBundle.list())
    } else {
      await onApiError(res)
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:configBundles'),
    url: routes.configBundle.list(),
  }

  return (
    <Layout title={t('configBundleName', configBundle)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: configBundle.name,
            url: routes.configBundle.details(configBundle.id),
          },
        ]}
      >
        <DetailsPageMenu
          submit={submit}
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: configBundle.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: configBundle.name,
          })}
        />
      </PageHeading>
      {editing ? (
        <EditConfigBundleCard submit={submit} configBundle={configBundle} onConfigBundleEdited={setConfigBundle} />
      ) : (
        <ConfigBundleCard configBundle={detailsToConfigBundle(configBundle)} />
      )}
      <span className="text-white">TODO deployment list and config</span>
    </Layout>
  )
}

export default ConfigBundleDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const configBundleId = context.query.configBundleId as string

  const configBundle = await getCruxFromContext<ConfigBundleDetails>(
    context,
    routes.configBundle.api.details(configBundleId),
  )

  return {
    props: {
      configBundle,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
