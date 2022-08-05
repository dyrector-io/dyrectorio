import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoModal from '@app/elements/dyo-modal'
import DyoTag from '@app/elements/dyo-tag'
import { useOverflowDetection } from '@app/hooks/use-overflow-detection'
import { ProductDetails } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useState } from 'react'

interface ProductDetailsCardProps {
  className?: string
  product: ProductDetails
}

const ProductDetailsCard = (props: ProductDetailsCardProps) => {
  const { t } = useTranslation('products')

  const { product } = props

  const version = product.type === 'simple' ? product.versions[0] : null

  const [overflow, overflowRef] = useOverflowDetection<HTMLParagraphElement>()
  const [showAll, setShowAll] = useState(false)

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
        <div className="flex flex-row">
          <Image src="/product_default.svg" alt={t('altPicture', { name: product.name })} width={100} height={100} />

          <div className="flex flex-col flex-grow">
            <DyoHeading element="h5" className="text-lg text-bright ml-4">
              {product.name}
            </DyoHeading>

            <div className="flex flex-row">
              <p className="text-md text-bright m-4">{product.description}</p>

              <div className="flex flex-col flex-grow">
                <span className="self-end text-bright whitespace-nowrap ml-2">
                  {utcDateToLocale(product.createdAt)}
                </span>

                <DyoTag className="ml-auto">{t(product.type).toUpperCase()}</DyoTag>
              </div>
            </div>
          </div>
        </div>

        {!version ? null : (
          <>
            <span className="text-bright font-bold mt-2">{t('versions:changelog')}</span>

            <p
              ref={overflowRef}
              className={clsx('text-md text-bright mt-2 max-h-44', overflow ? 'line-clamp-6 mb-6' : 'mb-8')}
            >
              {version.changelog}
            </p>

            {!overflow ? null : (
              <DyoButton className="ml-auto my-2" text onClick={() => setShowAll(true)}>
                {t('showAll')}
              </DyoButton>
            )}

            {!showAll ? null : (
              <DyoModal
                className="w-1/2 h-1/2"
                title={t('changelogName', { name: version.name })}
                open={showAll}
                onClose={() => setShowAll(false)}
              >
                <p className="text-bright mt-8 overflow-y-auto">{version.changelog}</p>
              </DyoModal>
            )}
          </>
        )}
      </DyoCard>
    </>
  )
}

export default ProductDetailsCard
