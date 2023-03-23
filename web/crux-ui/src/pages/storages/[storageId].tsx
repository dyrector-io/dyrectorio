import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import EditStorageCard from '@app/components/storages/edit-storage-card'
import StorageCard from '@app/components/storages/storage-card'
import { defaultApiErrorHandler } from '@app/errors'
import { StorageDetails } from '@app/models'
import { ROUTE_REGISTRIES, storageApiUrl, storageUrl } from '@app/routes'
import { fetchCrux, toastWarning, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

interface StorageDetailsPageProps {
  storage: StorageDetails
}

const StorageDetailsPage = (props: StorageDetailsPageProps) => {
  const { storage: propsStorage } = props

  const { t } = useTranslation('storages')

  const router = useRouter()

  const [storage, setStorage] = useState(propsStorage)
  const [editing, setEditing] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const handleApiError = defaultApiErrorHandler(t)

  const onStorageEdited = (it: StorageDetails) => {
    setEditing(false)
    setStorage(it)
  }

  const onDelete = async () => {
    const res = await fetch(storageApiUrl(storage.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.back()
    } else if (res.status === 412) {
      toastWarning(t('inUse'))
    } else {
      handleApiError(res)
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:storages'),
    url: ROUTE_REGISTRIES,
  }

  return (
    <Layout title={t('storagesName', storage)}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: storage.name,
            url: storageUrl(storage.id),
          },
        ]}
      >
        <DetailsPageMenu
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: storage.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: storage.name,
          })}
        />
      </PageHeading>

      {!editing ? (
        <StorageCard storage={storage} />
      ) : (
        <EditStorageCard className="p-8" storage={storage} onStorageEdited={onStorageEdited} submitRef={submitRef} />
      )}
    </Layout>
  )
}

export default StorageDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const storageId = context.query.storageId as string

  const res = await fetchCrux(context, storageApiUrl(storageId))
  const storage = (await res.json()) as StorageDetails

  return {
    props: {
      storage,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
