import { Layout, PageHead } from '@app/components/layout'
import EditProductCard from '@app/components/products/edit-product-card'
import ProductDetailsCard from '@app/components/products/product-details-card'
import ProductVersionsSection from '@app/components/products/product-versions-section'
import EditVersionCard from '@app/components/products/versions/edit-version-card'
import IncreaseVersionCard from '@app/components/products/versions/increase-version-card'
import VersionSections from '@app/components/products/versions/version-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import LoadingIndicator from '@app/elements/loading-indicator'
import {
  EditableProduct,
  ProductDetails,
  productDetailsToEditableProduct,
  updateProductDetailsWithEditableProduct,
  Version,
  VersionDetails,
} from '@app/models'
import { productApiUrl, productUrl, ROUTE_PRODUCTS, versionUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
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
  const { t } = useTranslation('products')
  const router = useRouter()

  const [product, setProduct] = useState(props.product)
  const [versions, setVersions] = useState(props.product.versions)
  const [editState, setEditState] = useState<ProductDetailsEditState>('version-list')
  const [increaseTarget, setIncreaseTarget] = useState<Version>(null)
  const [saving, setSaving] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const simpleProduct = product.type === 'simple'

  const onProductEdited = (edit: EditableProduct) => {
    const newProduct = updateProductDetailsWithEditableProduct(product, edit)
    setEditState('version-list')
    setProduct(newProduct)
    setVersions(newProduct.versions)
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

  const onVersionEdited = (version: Version) => {
    setVersions([
      ...versions,
      {
        ...version,
        increasable: version.type === 'incremental',
      },
    ])
    setEditState('version-list')
  }

  const onIncreaseVersion = (version: Version) => {
    setIncreaseTarget(version)
    setEditState('increase-version')
  }

  const onVersionIncreased = (version: Version) => router.push(versionUrl(product.id, version.id))

  const pageLink: BreadcrumbLink = {
    name: t('common:product'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: product.name,
      url: productUrl(product.id),
    },
  ]

  const pageMenuTexts = {
    addDetailsItem: t('addDetailsItem'),
  }

  return (
    <Layout>
      <PageHead title={t('title-product', { name: product.name })} />
      <PageHeading pageLink={pageLink} subLinks={sublinks}>
        {saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        <DetailsPageMenu
          texts={pageMenuTexts}
          onAdd={simpleProduct ? null : onAddVersion}
          onDelete={onDelete}
          editing={editState !== 'version-list'}
          setEditing={editing => setEditState(editing ? 'edit-product' : 'version-list')}
          submitRef={submitRef}
          deleteModalTitle={t('common:confirmDelete', { name: product.name })}
          deleteModalDescription={t('deleteDescription', {
            name: product.name,
          })}
        />
      </PageHeading>

      {editState === 'version-list' ? (
        <ProductDetailsCard product={product} className="mb-4 p-6" />
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
          onVersionEdited={onVersionEdited}
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

      {editState !== 'version-list' ? null : simpleProduct ? (
        <VersionSections product={product} version={props.simpleProductVersionDetails} setSaving={setSaving} />
      ) : (
        <ProductVersionsSection productId={product.id} versions={versions} onIncrease={onIncreaseVersion} />
      )}
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
