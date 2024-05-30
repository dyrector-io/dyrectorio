import { Layout } from '@app/components/layout'
import EditPackageCard from '@app/components/packages/edit-package-card'
import PackageCard from '@app/components/packages/package-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import useAnchor from '@app/hooks/use-anchor'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Package } from '@app/models'
import { ANCHOR_NEW, ListRouteOptions, TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

type PackagesPageProps = {
  packages: Package[]
}

const PackagesPage = (props: PackagesPageProps) => {
  const { packages } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()
  const router = useRouter()
  const anchor = useAnchor()

  const filters = useFilters<Package, TextFilter>({
    filters: [
      textFilterFor<Package>(pack => [
        pack.name,
        pack.description,
        pack.icon,
        ...pack.environments,
        ...pack.versionChains.map(it => it.project.name),
        ...pack.versionChains.map(it => it.earliest.name),
        ...pack.versionChains.map(it => it.latest?.name).filter(it => !!it),
      ]),
    ],
    initialData: packages,
  })

  const creating = anchor === ANCHOR_NEW
  const submit = useSubmit()

  const onPackageCreated = async (pack: Package) => {
    // When creating navigate the user to the project detail page
    await router.push(routes.package.details(pack.id))
  }

  const onRouteOptionsChange = async (routeOptions: ListRouteOptions) => {
    await router.replace(routes.package.list(routeOptions))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:packages'),
    url: routes.package.list(),
  }

  return (
    <Layout title={pageLink.name}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} onRouteOptionsChange={onRouteOptionsChange} submit={submit} />
      </PageHeading>

      {creating && <EditPackageCard className="mb-8 px-8 py-6" submit={submit} onPackageEdited={onPackageCreated} />}

      {filters.items.length > 0 ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })} />

          <DyoWrap className="gap-4 mt-4" itemClassName="lg:w-1/2 xl:w-1/3">
            {filters.filtered.map((it, index) => (
              <PackageCard className="w-full p-8" key={`package-${index}`} pack={it} />
            ))}
          </DyoWrap>
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}
export default PackagesPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const packages = await getCruxFromContext<Package[]>(context, routes.package.api.list())

  return {
    props: {
      packages,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
