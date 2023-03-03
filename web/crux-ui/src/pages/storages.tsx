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
import { Storage, StorageListItem } from '@app/models'
import { ROUTE_STORAGES, storageUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

interface StoragesPageProps {
  storages: StorageListItem[]
}

const StoragesPage = (props: StoragesPageProps) => {
  const { storages } = props

  const { t } = useTranslation('storages')

  const filters = useFilters<StorageListItem, TextFilter>({
    filters: [textFilterFor<StorageListItem>(it => [it.name, it.url, it.description, it.icon])],
    initialData: storages,
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const onCreated = (storage: Storage) => {
    setCreating(false)
    filters.setItems([...filters.items, storage])
  }

  const selfLink: BreadcrumbLink = {
    name: t('common:storages'),
    url: ROUTE_STORAGES,
  }

  return (
    <Layout title={t('common:storages')}>
      <PageHeading pageLink={selfLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : (
        <EditStorageCard className="mb-8 px-8 py-6" submitRef={submitRef} onStorageEdited={onCreated} />
      )}
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
                  titleHref={storageUrl(it.id)}
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

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    storages: await cruxFromContext(context).storage.getAll(),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
