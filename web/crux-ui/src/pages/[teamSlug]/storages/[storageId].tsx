import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import EditStorageCard from '@app/components/storages/edit-storage-card'
import StorageCard from '@app/components/storages/storage-card'
import { defaultApiErrorHandler } from '@app/errors'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { StorageDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { toastWarning, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'

interface StorageDetailsPageProps {
  storage: StorageDetails
}

const StorageDetailsPage = (props: StorageDetailsPageProps) => {
  const { storage: propsStorage } = props

  const { t } = useTranslation('storages')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [storage, setStorage] = useState(propsStorage)
  const [editing, setEditing] = useState(false)
  const submit = useSubmit()

  const handleApiError = defaultApiErrorHandler(t)

  const onStorageEdited = (it: StorageDetails) => {
    setEditing(false)
    setStorage(it)
  }

  const onDelete = async () => {
    const res = await fetch(routes.storage.api.details(storage.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(routes.storage.list())
    } else if (res.status === 412) {
      toastWarning(t('inUse'))
    } else {
      handleApiError(res)
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:storages'),
    url: routes.storage.list(),
  }

  return (
    <Layout title={t('storagesName', storage)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: storage.name,
            url: routes.storage.details(storage.id),
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          submit={submit}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: storage.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: storage.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <StorageCard storage={storage} />
      ) : (
        <EditStorageCard className="p-8" storage={storage} onStorageEdited={onStorageEdited} submit={submit} />
      )}
    </Layout>
  )
}

export default StorageDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const storageId = context.query.storageId as string

  const storage = await getCruxFromContext<StorageDetails>(context, routes.storage.api.details(storageId))

  return {
    props: {
      storage,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
