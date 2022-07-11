import { Layout } from '@app/components/layout'
import EditProductCard from '@app/components/products/edit-product-card'
import ProductCard from '@app/components/products/product-card'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import DyoChips from '@app/elements/dyo-chips'
import DyoWrap from '@app/elements/dyo-wrap'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Product, ProductType } from '@app/models'
import { productUrl, ROUTE_PRODUCTS } from '@app/routes'
import { utcDateToLocale, withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

type ProductFilter = TextFilter & {
  types: ProductType[]
}

const productTypeFilter = (items: Product[], filter: ProductFilter) => {
  const types = filter.types ?? []

  return items.filter(it => filter.types.includes(it.type))
}

interface ProductsPageProps {
  products: Product[]
}

const ProductsPage = (props: ProductsPageProps) => {
  const { t } = useTranslation('products')

  const router = useRouter()

  const initalTypeFilter = ['simple', 'complex'] as ProductType[]
  const filters = useFilters<Product, ProductFilter>({
    initialData: props.products,
    initialFilter: {
      text: '',
      types: initalTypeFilter,
    },
    filters: [
      textFilterFor<Product>(it => [it.name, it.description, it.type, utcDateToLocale(it.updatedAt)]),
      productTypeFilter,
    ],
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const onCreated = (product: Product) => {
    setCreating(false)
    filters.setItems([...filters.items, product])
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:product'),
    url: ROUTE_PRODUCTS,
  }

  const onNavigateToDetails = (id: string) => router.push(productUrl(id))

  return (
    <Layout>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>

      {!creating ? null : (
        <EditProductCard className="mb-8 px-8 py-6" submitRef={submitRef} onProductEdited={onCreated} />
      )}

      <Filters setTextFilter={it => filters.setFilter({ text: it })}>
        <DyoChips
          multiple
          className="pl-8"
          choices={initalTypeFilter}
          initialSelection={initalTypeFilter}
          converter={it => t(it)}
          onChoicesChange={types =>
            filters.setFilter({
              types,
            })
          }
        />
      </Filters>

      {filters.filtered ? (
        <DyoWrap>
          {filters.filtered.map((it, index) => (
            <ProductCard
              className="max-h-72 p-8"
              key={`product-${index}`}
              product={it}
              onClick={() => onNavigateToDetails(it.id)}
            />
          ))}
        </DyoWrap>
      ) : null}
    </Layout>
  )
}
export default ProductsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  return {
    props: {
      products: await cruxFromContext(context).products.getAll(),
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
