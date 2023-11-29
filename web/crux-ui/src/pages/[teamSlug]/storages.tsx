import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import EditStorageCard from '@app/components/storages/edit-storage-card'
import StorageCard from '@app/components/storages/storage-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Storage } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface StoragesPageProps {
  storages: Storage[]
}

const StoragesPage = (props: StoragesPageProps) => {
  const { storages } = props

  const { t } = useTranslation('storages')
  const routes = useTeamRoutes()

  const filters = useFilters<Storage, TextFilter>({
    filters: [textFilterFor<Storage>(it => [it.name, it.url, it.description, it.icon])],
    initialData: storages,
  })

  const [creating, setCreating] = useState(false)
  const submit = useSubmit()

  const onCreated = (storage: Storage) => {
    setCreating(false)
    filters.setItems([...filters.items, storage])
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:storages'),
    url: routes.storage.list(),
  }

  return (
    <Layout title={t('common:storages')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submit={submit} />
      </PageHeading>

      {!creating ? null : <EditStorageCard className="mb-8 px-8 py-6" submit={submit} onStorageEdited={onCreated} />}
      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })} />

          <DyoWrap itemClassName="lg:w-1/2 xl:w-1/3">
            {filters.filtered.map((it, index) => {
              const modulo3Class = index % 3 === 1 ? 'xl:mx-4' : null
              const modulo2Class = clsx(index % 2 > 0 ? 'lg:ml-2' : 'lg:mr-2', modulo3Class ?? 'xl:mx-0')

              return (
                <StorageCard
                  className={clsx('max-h-72 w-full p-8 my-2', modulo3Class, modulo2Class)}
                  key={`registry-${index}`}
                  storage={it}
                  titleHref={routes.storage.details(it.id)}
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

export default StoragesPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const storages = await getCruxFromContext<Storage[]>(context, routes.storage.api.list())

  return {
    props: {
      storages,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
