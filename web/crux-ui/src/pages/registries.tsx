import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { EnumFilter, enumFilterFor, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Registry, RegistryType, REGISTRY_TYPE_VALUES } from '@app/models'
import { API_REGISTRIES, registryUrl, ROUTE_REGISTRIES } from '@app/routes'
import { getCruxFromContext, withContextAuthorization } from '@app/utils'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

interface RegistriesPageProps {
  registries: Registry[]
}

type RegistryFilter = TextFilter & EnumFilter<RegistryType>

const RegistriesPage = (props: RegistriesPageProps) => {
  const { registries } = props

  const { t } = useTranslation('registries')

  const filters = useFilters<Registry, RegistryFilter>({
    filters: [
      textFilterFor<Registry>(it => [it.name, it.url, it.description, it.icon]),
      enumFilterFor<Registry, RegistryType>(it => [it.type]),
    ],
    initialData: registries,
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const onCreated = (registry: Registry) => {
    setCreating(false)
    filters.setItems([...filters.items, registry])
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:registries'),
    url: ROUTE_REGISTRIES,
  }

  return (
    <Layout title={t('common:registries')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : (
        <EditRegistryCard className="mb-8 px-8 py-6" submitRef={submitRef} onRegistryEdited={onCreated} />
      )}
      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={REGISTRY_TYPE_VALUES}
              converter={it => t(`type.${it}`)}
              selection={filters.filter?.enum}
              onSelectionChange={type => {
                filters.setFilter({
                  enum: type,
                })
              }}
            />
          </Filters>

          <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
            {filters.filtered.map((it, index) => {
              const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
              const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

              return (
                <RegistryCard
                  className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
                  key={`registry-${index}`}
                  registry={it}
                  titleHref={registryUrl(it.id)}
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

export default RegistriesPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const registries = await getCruxFromContext<Registry[]>(context, API_REGISTRIES)

  return {
    props: {
      registries,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
