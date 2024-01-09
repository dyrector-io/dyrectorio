import { Layout } from '@app/components/layout'
import CreateRegistryTokenCard from '@app/components/registries/create-registry-token-card'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import RegistryTokenCard from '@app/components/registries/registry-token-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortString } from '@app/elements/dyo-table'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  FindImageMessage,
  FindImageResult,
  FindImageResultMessage,
  RegistryDetails,
  RegistryDetailsDto,
  RegistryToken,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
  registryDetailsDtoToUI,
  registryDetailsToRegistry,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { QA_DIALOG_LABEL_REVOKE_REGISTRY_TOKEN } from 'quality-assurance'
import { useEffect, useState } from 'react'

type RegistryEditState = 'details' | 'edit' | 'create-token'

interface RegistryDetailsPageProps {
  registry: RegistryDetails
}

const RegistryDetailsPage = (props: RegistryDetailsPageProps) => {
  const { registry: propsRegistry } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()
  const router = useRouter()
  const handleApiError = defaultApiErrorHandler(t)

  const [registry, setRegistry] = useState(propsRegistry)
  const [editState, setEditState] = useState<RegistryEditState>('details')
  const submit = useSubmit()

  const [loading, setLoading] = useState(false)

  const filters = useFilters<FindImageResult, TextFilter>({
    initialData: [],
    filters: [textFilterFor<FindImageResult>(it => [it.name])],
  })

  const [confirmModalConfig, confirm] = useConfirmation()
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
  }, [registry.type, registry.id, sock])

  const onRegistryEdited = (reg: RegistryDetails) => {
    setEditState('details')
    setRegistry(reg)
  }

  const onDelete = async () => {
    const res = await fetch(routes.registry.api.details(registry.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      await router.replace(routes.registry.list())
    } else {
      await handleApiError(res)
    }
  }

  const onCreateRegistryToken = () => setEditState('create-token')
  const onRevokeRegistryToken = async () => {
    const confirmed = await confirm({
      qaLabel: QA_DIALOG_LABEL_REVOKE_REGISTRY_TOKEN,
      title: t('common:areYouSure'),
      description: t('tokens:areYouSureRevoke'),
      confirmText: t('tokens:revoke'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.registry.api.token(registry.id), { method: 'DELETE' })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    onRegistryEdited({
      ...registry,
      token: null,
    })
  }

  const onRegistryTokenCreated = (token: RegistryToken) =>
    onRegistryEdited({
      ...registry,
      token,
    })

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
          editing={editState === 'edit'}
          setEditing={it => setEditState(it ? 'edit' : 'details')}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: registry.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: registry.name,
          })}
        />
      </PageHeading>

      {editState === 'edit' ? (
        <EditRegistryCard className="p-8" registry={registry} onRegistryEdited={onRegistryEdited} submit={submit} />
      ) : editState === 'create-token' ? (
        <CreateRegistryTokenCard
          registry={registry}
          submit={submit}
          onDiscard={() => setEditState('details')}
          onTokenCreated={onRegistryTokenCreated}
        />
      ) : (
        <div className="flex flex-row gap-4">
          <RegistryCard className="flex-auto p-6" registry={registryDetailsToRegistry(registry)} disableTitleHref />

          {registry.type === 'v2' && (
            <RegistryTokenCard
              className="p-6"
              token={registry.token}
              onCreate={onCreateRegistryToken}
              onRevoke={onRevokeRegistryToken}
            />
          )}
        </div>
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
            <DyoTable
              data={filters.filtered}
              dataKey="name"
              pagination="client"
              initialSortColumn={0}
              initialSortDirection="asc"
            >
              <DyoColumn header={t('common:images')} field="name" sortable sort={sortString} />
            </DyoTable>
          </DyoCard>

          <DyoConfirmationModal config={confirmModalConfig} className="w-1/4" />
        </>
      )}
    </Layout>
  )
}

export default RegistryDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
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
