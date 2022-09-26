import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { Product } from '@app/models'
import { productUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import ProductTypeTag from './product-type-tag'

export interface ProductViewListProps {
  products: Product[]
}

const ProductViewList = (props: ProductViewListProps) => {
  const { products } = props

  const { t } = useTranslation('products')
  const router = useRouter()

  const onNavigateToDetails = (id: string) => router.push(productUrl(id))

  const columnWidths = ['w-6/12', 'w-1/12', 'w-2/12', 'w-2/12', 'w-1/12']
  const headers = ['name', 'versions', 'common:updatedAt', 'type', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg text-center pr-4', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    clsx('pr-4 text-center', defaultItemClass),
  ]

  const itemTemplate = (item: Product) => [
    <a>{item.name}</a>,
    <a>{item.versions}</a>,
    <a>{utcDateToLocale(item.updatedAt)}</a>,
    <div>
      <ProductTypeTag className="w-fit m-auto" type={item.type} />
    </div>,
    <Image
      className="cursor-pointer"
      src="/eye.svg"
      width={24}
      height={24}
      onClick={() => onNavigateToDetails(item.id)}
    />,
  ]

  return (
    <DyoCard className="relative mt-4">
      <DyoList
        headers={[...headers.map(h => t(h)), '']}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={products}
        noSeparator
        itemBuilder={itemTemplate}
      />
    </DyoCard>
  )
}

export default ProductViewList
