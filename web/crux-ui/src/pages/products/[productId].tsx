import { Layout } from '@app/components/layout'
import EditProductCard from '@app/components/products/edit-product-card'
import ProductDetailsCard from '@app/components/products/product-details-card'
import ProductVersionsSection from '@app/components/products/product-versions-section'
import EditVersionCard from '@app/components/products/versions/edit-version-card'
import IncreaseVersionCard from '@app/components/products/versions/increase-version-card'
import VersionSections from '@app/components/products/versions/version-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import {
  EditableProduct,
  EditableVersion,
  ProductDetails,
  productDetailsToEditableProduct,
  updateProductDetailsWithEditableProduct,
  Version,
  VersionDetails,
} from '@app/models'
import { productApiUrl, productUrl, ROUTE_PRODUCTS, versionSetDefaultApiUrl, versionUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface ProductDetailsPageProps {
  product: ProductDetails
  simpleProductVersionDetails?: VersionDetails
}

const ProductDetailsPage = (props: ProductDetailsPageProps) => {
  const { product: propsProduct, simpleProductVersionDetails } = props

  const { t } = useTranslation('products')
  const router = useRouter()

  const [product, setProduct] = useState(propsProduct)
  const [editState, setEditState] = useState<ProductDetailsEditState>('version-list')
  const [increaseTarget, setIncreaseTarget] = useState<Version>(null)
  const [saving, setSaving] = useState(false)
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const submitRef = useRef<() => Promise<any>>()

  const simpleProduct = product.type === 'simple'

  const handleApiError = defaultApiErrorHandler(t)

  const onProductEdited = (edit: EditableProduct) => {
    const newProduct = updateProductDetailsWithEditableProduct(product, edit)
    setEditState('version-list')
    setProduct(newProduct)
  }

  const onDelete = async () => {
    const res = await fetch(productApiUrl(product.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(ROUTE_PRODUCTS)
    } else {
      toast(t('errors:oops'))
    }
  }

  const onAddVersion = () => setEditState('add-version')

  const onVersionCreated = (version: EditableVersion) => {
    const newVersions = [
      ...product.versions,
      {
        ...version,
        default: product.versions.length < 1,
        increasable: version.type === 'incremental',
      },
    ]

    setProduct({
      ...product,
      versions: newVersions,
    })
    setEditState('version-list')
  }

  const onIncreaseVersion = (version: Version) => {
    setIncreaseTarget(version)
    setEditState('increase-version')
  }

  const onSetDefaultVersion = async (version: Version) => {
    const res = await fetch(versionSetDefaultApiUrl(product.id, version.id), {
      method: 'PUT',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    const newVersions = product.versions.map(it => ({
      ...it,
      default: it.id === version.id,
    }))

    setProduct({
      ...product,
      versions: newVersions,
    })
  }

  const onVersionIncreased = async (version: Version) => await router.push(versionUrl(product.id, version.id))

  const pageLink: BreadcrumbLink = {
    name: t('common:products'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: product.name,
      url: productUrl(product.id),
    },
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('addVersion'),
  }

  return (
    <Layout title={t('productsName', product)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        <DetailsPageMenu
          texts={pageMenuTexts}
          onAdd={simpleProduct ? null : onAddVersion}
          onDelete={product.deletable ? onDelete : null}
          editing={editState !== 'version-list'}
          setEditing={editing => setEditState(editing ? 'edit-product' : 'version-list')}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: product.name })}
          deleteModalDescription={t('proceedYouLoseAllDataToName', {
            name: product.name,
          })}
        />
      </PageHeading>

      {editState === 'version-list' ? (
        <ProductDetailsCard product={product} className={clsx('p-6', simpleProduct ? 'mb-4' : null)} />
      ) : editState === 'edit-product' ? (
        <EditProductCard
          className="mb-8 px-8 py-6"
          product={productDetailsToEditableProduct(product)}
          onProductEdited={onProductEdited}
          submitRef={submitRef}
        />
      ) : editState === 'add-version' ? (
        <EditVersionCard
          className="mb-8 px-8 py-6"
          product={product}
          submitRef={submitRef}
          onVersionEdited={onVersionCreated}
        />
      ) : (
        <IncreaseVersionCard
          className="mb-8 px-8 py-6"
          product={product}
          parent={increaseTarget}
          onVersionIncreased={onVersionIncreased}
          submitRef={submitRef}
        />
      )}

      {simpleProduct ? (
        <VersionSections
          product={product}
          version={simpleProductVersionDetails}
          setSaving={setSaving}
          setTopBarContent={setTopBarContent}
        />
      ) : editState === 'version-list' ? (
        <ProductVersionsSection
          productId={product.id}
          versions={product.versions}
          onIncrease={onIncreaseVersion}
          onSetAsDefault={onSetDefaultVersion}
        />
      ) : editState === 'add-version' || editState === 'edit-product' ? (
        <ProductVersionsSection disabled productId={product.id} versions={product.versions} />
      ) : null}
    </Layout>
  )
}

export default ProductDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const productId = context.query.productId as string

  const product = await cruxFromContext(context).products.getById(productId)

  const props: ProductDetailsPageProps = {
    product,
    simpleProductVersionDetails: null,
  }

  if (product.type === 'simple') {
    const version = product.versions[0]
    props.simpleProductVersionDetails = await cruxFromContext(context).versions.getById(version.id)
  }

  return {
    props,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

type ProductDetailsEditState = 'version-list' | 'edit-product' | 'add-version' | 'increase-version'
