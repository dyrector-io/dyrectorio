import { Layout } from '@app/components/layout'
import EditPackageCard from '@app/components/packages/edit-package-card'
import EditPackageEnvironmentCard from '@app/components/packages/edit-package-environment-card'
import PackageCard from '@app/components/packages/package-card'
import PackageEnvironmentCard from '@app/components/packages/package-environment-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import DyoWrap from '@app/elements/dyo-wrap'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PackageDetails, PackageEnvironment, packageDetailsToPackage } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import toast from 'react-hot-toast'

type PackageDetailsState = 'edit-package' | 'add-environment' | 'environments'

type PackageDetailsPageProps = {
  pack: PackageDetails
}

const PackageDetailsPage = (props: PackageDetailsPageProps) => {
  const { pack: propsPackage } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [pack, setPackage] = useState(propsPackage)
  const [state, setState] = useState<PackageDetailsState>('environments')

  const submit = useSubmit()

  const onPackageEdited = (newPack: PackageDetails) => {
    setState('environments')
    setPackage(newPack)
  }

  const onDelete = async () => {
    const res = await fetch(routes.package.api.details(pack.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.package.list())
    } else {
      toast(t('errors:oops'))
    }
  }

  const onAddEnvironment = () => setState('add-environment')

  const onEnvironmentCreated = (env: PackageEnvironment) => {
    const newEnvs = [...pack.environments, env]

    setPackage({
      ...pack,
      environments: newEnvs,
    })
    setState('environments')
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
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('addEnvironment'),
  }

  return (
    <Layout title={t('packageName', pack)}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DetailsPageMenu
          texts={pageMenuTexts}
          onAdd={onAddEnvironment}
          onDelete={onDelete}
          editing={state !== 'environments'}
          setEditing={editing => setState(editing ? 'edit-package' : 'environments')}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: pack.name })}
          deleteModalDescription={t('proceedYouLoseAllDataToName', {
            name: pack.name,
          })}
        />
      </PageHeading>

      <div className="flex flex-col gap-4">
        {state === 'environments' ? (
          <PackageCard pack={packageDetailsToPackage(pack)} hideEnvironments />
        ) : state === 'edit-package' ? (
          <EditPackageCard
            className="mb-8 px-8 py-6"
            package={pack}
            onPackageEdited={onPackageEdited}
            submit={submit}
          />
        ) : state === 'add-environment' ? (
          <EditPackageEnvironmentCard
            className="mb-8 px-8 py-6"
            packageId={pack.id}
            submit={submit}
            onEnvironmentEdited={onEnvironmentCreated}
          />
        ) : null}

        {state === 'environments' &&
          (pack.environments.length < 1 ? (
            <span>notyet</span>
          ) : (
            <DyoWrap className="gap-4" itemClassName="lg:w-1/2 xl:w-1/3">
              {pack.environments.map((env, index) => (
                <PackageEnvironmentCard key={`env-${index}`} packageId={pack.id} environment={env} />
              ))}
            </DyoWrap>
          ))}
      </div>
    </Layout>
  )
}

export default PackageDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const packageId = context.query.packageId as string

  const pack = await getCruxFromContext<PackageDetails>(context, routes.package.api.details(packageId))

  return {
    props: {
      pack,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
