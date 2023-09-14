import AddConfigBundleCard from '@app/components/config-bundles/add-config-bundle-card'
import ConfigBundleCard from '@app/components/config-bundles/config-bundle-card'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundle } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface ConfigBundlesPageProps {
  bundles: ConfigBundle[]
}

const ConfigBundles = (props: ConfigBundlesPageProps) => {
  const { bundles } = props

  const { t } = useTranslation('config-bundles')
  const routes = useTeamRoutes()
  const router = useRouter()

  const filters = useFilters<ConfigBundle, TextFilter>({
    filters: [textFilterFor<ConfigBundle>(it => [it.name])],
    initialData: bundles,
  })

  const [creating, setCreating] = useState(false)
  const submit = useSubmit()

  const onCreated = async (bundle: ConfigBundle) => {
    setCreating(false)
    filters.setItems([...filters.items, bundle])

    await router.push(routes.configBundles.details(bundle.id))
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:configBundles'),
    url: routes.configBundles.list(),
  }

  return (
    <Layout title={t('common:configBundles')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submit={submit} />
      </PageHeading>

      {!creating ? null : <AddConfigBundleCard className="mb-8 px-8 py-6" submit={submit} onCreated={onCreated} />}
      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })} />

          <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
            {filters.filtered.map((it, index) => {
              const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
              const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

              return (
                <ConfigBundleCard
                  className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
                  key={`bundle-${index}`}
                  configBundle={it}
                  titleHref={routes.configBundles.details(it.id)}
                />
              )
            })}
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

export default ConfigBundles

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const bundles = await getCruxFromContext<ConfigBundle[]>(context, routes.configBundles.api.list())

  return {
    props: {
      bundles,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
