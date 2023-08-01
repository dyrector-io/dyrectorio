import { Layout } from '@app/components/layout'
import EditRegistryCard from '@app/components/registries/edit-registry-card'
import RegistryCard from '@app/components/registries/registry-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { defaultApiErrorHandler } from '@app/errors'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { RegistryDetails, RegistryDetailsDto, registryDetailsDtoToUI, registryDetailsToRegistry } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

interface RegistryDetailsPageProps {
  registry: RegistryDetails
}

const RegistryDetailsPage = (props: RegistryDetailsPageProps) => {
  const { registry: propsRegistry } = props

  const { t } = useTranslation('registries')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [registry, setRegistry] = useState(propsRegistry)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

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
