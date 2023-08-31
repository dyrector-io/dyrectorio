import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { SortHeaderBuilderMapping, sortHeaderBuilder, stringSort, useSorting } from '@app/hooks/use-sorting'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  FindImageMessage,
  FindImageResult,
  FindImageResultMessage,
  RegistryDetails,
  RegistryDetailsDto,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
  registryDetailsDtoToUI,
  registryDetailsToRegistry,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useRef, useState } from 'react'

interface RegistryDetailsPageProps {
  registry: RegistryDetails
}

const defaultPagination: PaginationSettings = { pageNumber: 0, pageSize: 10 }

type FindImageResultSorting = 'name'
const sortHeaders: SortHeaderBuilderMapping<FindImageResultSorting> = {
  'common:images': 'name',
}

const RegistryDetailsPage = (props: RegistryDetailsPageProps) => {
  const { registry: propsRegistry } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()
  const router = useRouter()
  const handleApiError = defaultApiErrorHandler(t)

  const [registry, setRegistry] = useState(propsRegistry)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationSettings>()
  const [total, setTotal] = useState(0)

  const filters = useFilters<FindImageResult, TextFilter>({
    initialData: [],
    filters: [textFilterFor<FindImageResult>(it => [it.name])],
  })

  const sorting = useSorting<FindImageResult, FindImageResultSorting>(filters.filtered, {
    initialField: 'name',
    initialDirection: 'asc',
    sortFunctions: {
      name: stringSort,
    },
  })

  const sock = useWebSocket(routes.registry.socket())
  sock.on(WS_TYPE_FIND_IMAGE_RESULT, (message: FindImageResultMessage) => {
    if (message.registryId === registry?.id) {
      setLoading(false)
      setTotal(message.images.length)
      filters.setItems(
        message.images.map(it => ({
          name: it.name,
        })),
      )
      setPagination(defaultPagination)
    }
  })

  useEffect(() => {
    sock.send(WS_TYPE_FIND_IMAGE, {
      registryId: registry.id,
      filter: '',
    } as FindImageMessage)
    setLoading(true)
  }, [])

  useEffect(() => {
    setTotal(filters.filtered.length)
    setPagination(p => ({ pageNumber: 0, pageSize: p ? p.pageSize : defaultPagination.pageSize }))
  }, [filters.filtered])

  const onRegistryEdited = reg => {
    setEditing(false)
    setRegistry(reg)
  }

  const onDelete = async () => {
    const res = await fetch(routes.registry.api.details(registry.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(routes.registry.list())
    } else {
      handleApiError(res)
    }
  }

  const getPagedImages = () =>
    sorting.items.slice(
      pagination.pageNumber * pagination.pageSize,
      pagination.pageNumber * pagination.pageSize + pagination.pageSize,
    )

  const headers = ['common:images']
  const defaultHeaderClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 px-2 font-semibold'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]

  const defaultItemClass = 'h-11 min-h-min text-light-eased p-2 w-fit'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headerClasses.length - 3 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const itemTemplate = (item: FindImageResult) => [item.name]

  const pageLink: BreadcrumbLink = {
    name: t('common:registries'),
    url: routes.registry.list(),
  }

  return (
    <Layout title={t('registriesName', registry)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: registry.name,
            url: routes.registry.details(registry.id),
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: registry.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: registry.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <RegistryCard registry={registryDetailsToRegistry(registry)} />
      ) : (
        <EditRegistryCard
          className="p-8"
          registry={registry}
          onRegistryEdited={onRegistryEdited}
          submitRef={submitRef}
        />
      )}

      {loading ? (
        <div className="w-full flex justify-center mt-4">
          <LoadingIndicator />
        </div>
      ) : filters.items.length < 1 ? (
        <div className="items-center self-center mt-4">
          <DyoLabel>{t('common:noNameFound', { name: t('common:images') })}</DyoLabel>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <Filters setTextFilter={it => filters.setFilter({ text: it })} />
          </div>

          <DyoCard className="relative mt-4">
            <DyoList
              headers={[...headers, '']}
              headerClassName={headerClasses}
              itemClassName={itemClasses}
              data={getPagedImages()}
              noSeparator
              headerBuilder={sortHeaderBuilder<FindImageResult, FindImageResultSorting>(sorting, sortHeaders, text =>
                t(text),
              )}
              itemBuilder={itemTemplate}
              footer={<Paginator onChanged={setPagination} length={total} defaultPagination={defaultPagination} />}
            />
          </DyoCard>
        </>
      )}
    </Layout>
  )
}

export default RegistryDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const registryId = context.query.registryId as string

  const dto = await getCruxFromContext<RegistryDetailsDto>(context, routes.registry.api.details(registryId))
  const details = registryDetailsDtoToUI(dto)

  return {
    props: {
      registry: details,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
