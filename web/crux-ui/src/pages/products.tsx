import { Layout } from '@app/components/layout'
import EditProductCard from '@app/components/products/edit-product-card'
import ProductCard from '@app/components/products/product-card'
import ProductViewList from '@app/components/products/product-view-list'
import ProductViewTile from '@app/components/products/product-view-tile'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import ViewModeToggle, { ViewMode } from '@app/components/shared/view-mode-toggle'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Product } from '@app/models'
import { productUrl, ROUTE_PRODUCTS } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

export const PRODUCT_TYPE_FILTER_VALUES = ['simple', 'complex', 'all'] as const
export type ProductTypeFilter = typeof PRODUCT_TYPE_FILTER_VALUES[number]

type ProductFilter = TextFilter & {
  type: ProductTypeFilter
}

const productTypeFilter = (items: Product[], filter: ProductFilter) => {
  if (filter.type === 'all') {
    return items
  }
  return items.filter(it => filter.type.includes(it.type))
}

interface ProductsPageProps {
  products: Product[]
}

const ProductsPage = (props: ProductsPageProps) => {
  const { products } = props

  const { t } = useTranslation('products')

  const router = useRouter()

  const initalTypeFilter = 'all' as ProductTypeFilter
  const filters = useFilters<Product, ProductFilter>({
    initialData: products,
    initialFilter: {
      text: '',
      type: initalTypeFilter,
    },
    filters: [
      textFilterFor<Product>(it => [it.name, it.description, it.type, utcDateToLocale(it.updatedAt)]),
      productTypeFilter,
    ],
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const [viewMode, setViewMode] = useState<ViewMode>('tile')

  const onCreated = (product: Product) => {
    setCreating(false)
    filters.setItems([...filters.items, product])
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:products'),
    url: ROUTE_PRODUCTS,
  }

  const onNavigateToDetails = (id: string) => router.push(productUrl(id))

  return (
    <Layout title={t('common:products')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : (
        <EditProductCard className="mb-8 px-8 py-6" submitRef={submitRef} onProductEdited={onCreated} />
      )}

      <Filters setTextFilter={it => filters.setFilter({ text: it })}>
        <DyoChips
          className="pl-8"
          choices={PRODUCT_TYPE_FILTER_VALUES}
          initialSelection={initalTypeFilter}
          converter={it => t(it)}
          onSelectionChange={type => {
            filters.setFilter({
              type,
            })
          }}
        />
      </Filters>

      {filters.items.length ? (
        <>
          <div className='flex flex-row mt-4 justify-end'>
            <ViewModeToggle viewMode={viewMode} onViewModeChanged={setViewMode} />
          </div>

          {viewMode == 'tile' ? (
            <ProductViewTile products={filters.filtered} />
          ) : (
            <ProductViewList products={filters.filtered} />
          )}
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}
export default ProductsPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    products: await cruxFromContext(context).products.getAll(),
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
