import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import { ImageHorizontalList } from '@app/components/registries/image-horizontal-list'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import Paginator, { PaginationSettings } from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  FindImageMessage,
  FindImageResult,
  FindImageResultMessage,
  RegistryDetails,
  RegistryDetailsDto,
  SORTING_TYPE_VALUES,
  SortingType,
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

const RegistryDetailsPage = (props: RegistryDetailsPageProps) => {
  const { registry: propsRegistry } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [registry, setRegistry] = useState(propsRegistry)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const [images, setImages] = useState<FindImageResult[]>([])

  const [pagination, setPagination] = useState<PaginationSettings>()
  const [total, setTotal] = useState(0)

  const filters = useFilters<FindImageResult, TextFilter>({
    initialData: images,
    filters: [textFilterFor<FindImageResult>(it => [it.name])],
  })
  const [sorting, setSorting] = useState<SortingType>('none')

  const headers = ['common:images']
  const defaultTitleClass = 'h-11 uppercase text-bright text-sm bg-medium-eased py-3 px-2 font-semibold'
  const titleClass = [
    clsx('rounded-tl-lg pl-6', defaultTitleClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultTitleClass),
    clsx('text-center', defaultTitleClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultTitleClass),
  ]

  const itemTemplate = (item: FindImageResult) => [item.name]

  const sock = useWebSocket(routes.registry.socket())

  sock.on(WS_TYPE_FIND_IMAGE_RESULT, (message: FindImageResultMessage) => {
    if (message.registryId === registry?.id) {
      setTotal(message.images.length)
      setImages(
        message.images.map(it => ({
          name: it.name,
        })),
      )
      setPagination(defaultPagination)
    }
  })

  const handleApiError = defaultApiErrorHandler(t)

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

  const pageLink: BreadcrumbLink = {
    name: t('common:registries'),
    url: routes.registry.list(),
  }

  const sortItems = (items: FindImageResult[]) => {
    const sorted = [...items]
    switch (sorting) {
      case 'az': {
        return sorted.sort((a, b) => (a.name < b.name ? -1 : 1))
      }
      case 'za': {
        return sorted.sort((a, b) => (a.name > b.name ? -1 : 1))
      }
      default: {
        return sorted
      }
    }
  }

  const getPagedImages = () =>
    sortItems(filters.filtered).slice(
      pagination.pageNumber * pagination.pageSize,
      pagination.pageNumber * pagination.pageSize + pagination.pageSize,
    )

  useEffect(() => {
    sock.send(WS_TYPE_FIND_IMAGE, {
      registryId: registry.id,
      filter: '',
    } as FindImageMessage)
  }, [])

  useEffect(() => {
    filters.setItems(images)
  }, [images, sorting])

  useEffect(() => {
    setTotal(filters.filtered.length)
    setPagination({ pageNumber: 0, pageSize: pagination ? pagination.pageSize : defaultPagination.pageSize })
  }, [filters.filtered])

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

      {images.length < 1 ? (
        <div className="items-center self-center mt-4">
          <DyoLabel>{t('common:noNameFound', { name: t('common:images') })}</DyoLabel>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <Filters setTextFilter={it => filters.setFilter({ text: it })}>
              <DyoChips
                className="pl-6"
                choices={SORTING_TYPE_VALUES}
                converter={(it: SortingType) => t(`common:sorting.${it}`)}
                selection={sorting}
                onSelectionChange={it => setSorting(it)}
              />
            </Filters>
          </div>
          <DyoCard className="relative mt-4">
            <ImageHorizontalList
              title={t('common:images')}
              titleClassName={titleClass}
              data={getPagedImages()}
              noSeparator
              footer={<Paginator onChanged={setPagination} length={total} defaultPagination={defaultPagination} />}
              itemBuilder={itemTemplate}
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
