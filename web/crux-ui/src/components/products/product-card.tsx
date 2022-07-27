import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoTag from '@app/elements/dyo-tag'
import { Product } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import React from 'react'

interface ProductCardProps {
  className?: string
  product: Product
  onClick?: () => void
}

const ProductCard = (props: ProductCardProps) => {
  const { t } = useTranslation('products')

  const { product, onClick } = props

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col flex-grow')}>
        <div className="flex flex-col overflow-hidden">

          <div className="flex flex-row">

            <Image
              className={clsx(onClick ? 'cursor-pointer' : null)}
              src="/product_default.svg"
              alt={t('altPicture', { name: product.name })}
              width={100}
              height={100}
              onClick={onClick}
            />

            <div className="flex flex-col flex-grow">
              <DyoHeading element="h5" className="text-lg text-bright ml-4" onClick={onClick}>
                {product.name}
              </DyoHeading>

              <div className="flex flex-row justify-start">
                <span className="text-bright font-bold ml-4">{`${t('common:updatedAt')}:`}</span>

                <span className="text-bright ml-2">{utcDateToLocale(product.updatedAt)}</span>
              </div>

              <DyoTag className="ml-auto">{t(product.type).toUpperCase()}</DyoTag>
            </div>

          </div>

          <p className="text-md text-bright mt-4 overflow-y-auto">{product.description}</p>

        </div>

      </DyoCard>
    </>
  )
}

export default ProductCard
