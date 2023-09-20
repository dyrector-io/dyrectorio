import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTable, { DyoColumn, sortString } from '@app/elements/dyo-table'
import LoadingIndicator from '@app/elements/loading-indicator'
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
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
  registryDetailsDtoToUI,
  registryDetailsToRegistry,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useRef, useState } from 'react'

interface RegistryDetailsPageProps {
  registry: RegistryDetails
}

type FindImageResultSorting = 'name'

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

  const filters = useFilters<FindImageResult, TextFilter>({
    initialData: [],
    filters: [textFilterFor<FindImageResult>(it => [it.name])],
  })

  const sock = useWebSocket(routes.registry.socket())
  sock.on(WS_TYPE_FIND_IMAGE_RESULT, (message: FindImageResultMessage) => {
    if (message.registryId === registry?.id) {
      setLoading(false)
      filters.setItems(
        message.images.map(it => ({
          name: it.name,
        })),
      )
    }
  })

  useEffect(() => {
    if (registry.type === 'unchecked') {
      return
    }

    sock.send(WS_TYPE_FIND_IMAGE, {
      registryId: registry.id,
      filter: '',
    } as FindImageMessage)
    setLoading(true)
  }, [])

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

      {registry.type === 'unchecked' ? null : loading ? (
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
            <DyoTable data={filters.filtered} pagination="client" initialSortColumn={0} initialSortDirection="asc">
              <DyoColumn header={t('common:images')} field="name" sortable sort={sortString} />
            </DyoTable>
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
