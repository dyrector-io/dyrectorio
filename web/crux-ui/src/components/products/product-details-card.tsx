import { DyoCard } from '@app/elements/dyo-card'
import { DyoExpandableText } from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoTag from '@app/elements/dyo-tag'
import { ProductDetails } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ProductDetailsCardProps {
  className?: string
  product: ProductDetails
}

const ProductDetailsCard = (props: ProductDetailsCardProps) => {
  const { t } = useTranslation('products')

  const { product } = props

  const version = product.type === 'simple' ? product.versions[0] : null

  return (
    <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
      <div className="flex flex-row">
        <div>
          <Image
            src="/product_default.svg"
            alt={t('altPicture', { name: product.name })}
            width={100}
            height={100}
            layout="fixed"
          />
        </div>

        <div className="flex flex-col flex-grow ml-6">
          <div className="flex flex-row">
            <DyoHeading element="h5" className="text-xl text-bright leading-none">
              {product.name}
            </DyoHeading>

            <div className="flex flex-col ml-auto">
              <span className="text-bright whitespace-nowrap">{utcDateToLocale(product.createdAt)}</span>

              <DyoTag className="mt-2 ml-auto">{t(product.type).toUpperCase()}</DyoTag>
            </div>
          </div>

          <div className="overflow-hidden">
            <DyoExpandableText
              text={product.description}
              lineClamp={2}
              className="text-md text-light"
              modalTitle={product.name}
            />
          </div>
        </div>
      </div>

      {!version ? null : (
        <>
          <span className="text-bright font-bold mt-2">{t('versions:changelog')}</span>

          <DyoExpandableText
            text={version.changelog}
            lineClamp={6}
            className="text-md text-bright mt-2 max-h-44"
            buttonClassName="ml-auto my-2"
            modalTitle={t('changelogName', { name: version.name })}
          />
        </>
      )}
    </DyoCard>
  )
}

export default ProductDetailsCard
