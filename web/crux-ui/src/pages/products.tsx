import { Layout } from '@app/components/layout'
import EditProductCard from '@app/components/products/edit-product-card'
import ProductViewList from '@app/components/products/product-view-list'
import ProductViewTile from '@app/components/products/product-view-tile'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import ViewModeToggle, { ViewMode } from '@app/components/shared/view-mode-toggle'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Product, ProductType, PRODUCT_TYPE_VALUES } from '@app/models'
import { API_PRODUCTS, ROUTE_PRODUCTS } from '@app/routes'

import { auditToLocaleDate, fetchCrux, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRef, useState } from 'react'

type ProductFilter = TextFilter & {
  type?: ProductType | 'all'
}

const productTypeFilter = (items: Product[], filter: ProductFilter) => {
  if (!filter?.type || filter.type === 'all') {
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

  const filters = useFilters<Product, ProductFilter>({
    initialData: products,
    filters: [
      textFilterFor<Product>(it => [it.name, it.description, it.type, auditToLocaleDate(it.audit)]),
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

  return (
    <Layout title={t('common:products')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>
      {!creating ? null : (
        <EditProductCard className="mb-8 px-8 py-6" submitRef={submitRef} onProductEdited={onCreated} />
      )}

      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={PRODUCT_TYPE_VALUES}
              converter={it => t(it)}
              selection={filters.filter?.type}
              onSelectionChange={type => {
                filters.setFilter({
                  type,
                })
              }}
            />
          </Filters>
          <div className="flex flex-row mt-4 justify-end">
            <ViewModeToggle viewMode={viewMode} onViewModeChanged={setViewMode} />
          </div>

          {viewMode === 'tile' ? (
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

const getPageServerSideProps = async (context: NextPageContext) => {
  const res = await fetchCrux(context, API_PRODUCTS)
  const products = (await res.json()) as Product[]

  return {
    props: {
      products,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
