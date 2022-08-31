import { Layout } from '@app/components/layout'
import EditVersionCard from '@app/components/products/versions/edit-version-card'
import VersionDetailsCard from '@app/components/products/versions/version-details-card'
import VersionSections from '@app/components/products/versions/version-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import { ROUTE_PRODUCTS } from '@app/const'
import LoadingIndicator from '@app/elements/loading-indicator'
import { ProductDetails, Version, VersionDetails } from '@app/models'
import { productUrl, versionApiUrl, versionUrl } from '@app/routes'
import { anchorLinkOf, redirectTo, searchParamsOf, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface VersionDetailsPageProps {
  product: ProductDetails
  version: VersionDetails
}

const VersionDetailsPage = (props: VersionDetailsPageProps) => {
  const { product, version: propsVersion } = props

  const { t } = useTranslation('versions')
  const router = useRouter()

  const [version, setVersion] = useState(propsVersion)
  const [editing, setEditing] = useState(anchorLinkOf(router) === '#edit')
  const [saving, setSaving] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const onVersionEdited = (newVersion: Version) => {
    setEditing(false)
    setVersion({
      ...version,
      ...newVersion,
    })
  }

  const onDelete = async () => {
    const res = await fetch(versionApiUrl(product.id, version.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(productUrl(product.id))
    } else {
      toast(t('errors:oops'))
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:versions'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: product.name,
      url: productUrl(product.id),
    },
    {
      name: version.name,
      url: versionUrl(product.id, version.id),
    },
  ]

  return (
    <Layout title={t('versionsName', { product: product.name, name: version.name })}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        {!version.mutable ? null : (
          <DetailsPageMenu
            onDelete={version.increasable ? onDelete : null}
            editing={editing}
            setEditing={setEditing}
            submitRef={submitRef}
            deleteModalTitle={t('common:confirmDelete', { name: version.name })}
            deleteModalDescription={t('deleteDescription', {
              name: version.name,
            })}
          />
        )}
      </PageHeading>

      {!editing ? (
        <VersionDetailsCard version={version} className="mb-4 p-6" />
      ) : (
        <EditVersionCard
          className="mb-8 px-8 py-6"
          product={product}
          version={version}
          submitRef={submitRef}
          onVersionEdited={onVersionEdited}
        />
      )}

      {editing ? null : <VersionSections product={product} version={version} setSaving={setSaving} />}
    </Layout>
  )
}

export default VersionDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const productId = context.query.productId as string
  const versionId = context.query.versionId as string

  const product = await cruxFromContext(context).products.getById(productId)
  if (product.type === 'simple') {
    return redirectTo(`${productUrl(product.id)}${searchParamsOf(context)}`)
  }

  const version = await cruxFromContext(context).versions.getById(versionId)

  return {
    props: {
      product,
      version,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
