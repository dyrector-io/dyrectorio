import { Layout } from '@app/components/layout'
import EditPackageEnvironmentCard from '@app/components/packages/edit-package-environment-card'
import PackageEnvironmentCard from '@app/components/packages/package-environment-card'
import PackageEnvironmentVersionList from '@app/components/packages/package-environment-version-list'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PackageEnvironment, PackageEnvironmentDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import toast from 'react-hot-toast'

type EnvironmentDetailsPageProps = {
  environment: PackageEnvironmentDetails
}

const EnvironmentDetailsPage = (props: EnvironmentDetailsPageProps) => {
  const { environment: propsEnv } = props
  const { package: pack } = propsEnv

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [env, setEnv] = useState(propsEnv)
  const [editing, setEditing] = useState(false)

  const submit = useSubmit()

  const onEnvEdited = (newEnv: PackageEnvironmentDetails) => setEnv(newEnv)

  const onDelete = async () => {
    const res = await fetch(routes.package.api.environmentDetails(pack.id, env.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.package.details(pack.id))
    } else {
      toast(t('errors:oops'))
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:packages'),
    url: routes.package.list(),
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: pack.name,
      url: routes.package.details(pack.id),
    },
    {
      name: env.name,
      url: routes.package.environmentDetails(pack.id, env.id),
    },
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('addEnvironment'),
  }

  return (
    <Layout title={t('packageName', env)}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DetailsPageMenu
          texts={pageMenuTexts}
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: env.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: env.name,
          })}
        />
      </PageHeading>

      <div className="flex flex-col gap-4">
        {!editing ? (
          <PackageEnvironmentCard packageId={pack.id} environment={env} />
        ) : (
          <EditPackageEnvironmentCard packageId={pack.id} environment={env} onEnvironmentEdited={onEnvEdited} />
        )}

        {!editing && <PackageEnvironmentVersionList environment={env} />}
      </div>
    </Layout>
  )
}

export default EnvironmentDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const packageId = context.query.packageId as string
  const environmentId = context.query.environmentId as string

  const env = await getCruxFromContext<PackageEnvironment>(
    context,
    routes.package.api.environmentDetails(packageId, environmentId),
  )

  return {
    props: {
      packageId,
      environment: env,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
