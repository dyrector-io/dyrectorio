import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { Product } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import ProductTypeTag from './product-type-tag'

interface ProductCardProps {
  className?: string
  product: Product
  titleHref?: string
}

const ProductCard = (props: ProductCardProps) => {
  const { product, titleHref, className } = props

  const { t } = useTranslation('products')

  const image = (
    <Image src="/product_default.svg" alt={t('altPicture', { name: product.name })} width={100} height={100} />
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col flex-grow w-full')}>
      <div className="flex flex-col w-full">
        <div className="flex flex-row">
          {titleHref ? <Link href={titleHref}>{image}</Link> : image}

          <div className="flex flex-col flex-grow">
            <DyoHeading element="h5" className="text-lg text-bright ml-4" href={titleHref}>
              {product.name}
            </DyoHeading>

            <div className="flex flex-row justify-start">
              <span className="text-bright font-bold ml-4">{`${t('common:updatedAt')}:`}</span>

              <span className="text-bright ml-2" suppressHydrationWarning>
                {auditToLocaleDate(product.audit)}
              </span>
            </div>

            <ProductTypeTag className="ml-auto" type={product.type} />
          </div>
        </div>

        <p className="text-md text-bright mt-4 line-clamp-2 break-words">{product.description}</p>
      </div>
    </DyoCard>
  )
}

export default ProductCard
