import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import { ROUTE_REGISTRIES } from '@app/const'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Registry } from '@app/models'
import { registryUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

interface RegistriesPageProps {
  registries: Registry[]
}

const RegistriesPage = (props: RegistriesPageProps) => {
  const { registries } = props

  const { t } = useTranslation('registries')

  const router = useRouter()

  const filters = useFilters<Registry, TextFilter>({
    filters: [textFilterFor<Registry>(it => [it.name, it.url, it.description, it.icon])],
    initialData: registries,
    initialFilter: { text: '' },
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const onCreated = (registry: Registry) => {
    setCreating(false)
    filters.setItems([...filters.items, registry])
  }

  const onNavigateToDetails = (id: string) => router.push(registryUrl(id))

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

      <Filters setTextFilter={it => filters.setFilter({ text: it })} />

      <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
        {filters.filtered.map((it, index) => {
          const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
          const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

          return (
            <RegistryCard
              className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
              key={`registry-${index}`}
              registry={it}
              onClick={() => onNavigateToDetails(it.id)}
            />
          )
        })}
      </DyoWrap>
    </Layout>
  )
}

export default RegistriesPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    registries: await cruxFromContext(context).registries.getAll(),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
