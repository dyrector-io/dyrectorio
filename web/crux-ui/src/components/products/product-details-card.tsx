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
    <>
      <DyoCard className={clsx(props.className ?? 'p-6')}>
        <div className="float-left">
          <Image
            src="/product_default.svg"
            alt={t('altPicture', { name: product.name })}
            width={100}
            height={100}
            layout="fixed"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <DyoHeading element="h5" className="text-xl text-bright ml-6 mb-1">
            {product.name}
          </DyoHeading>

          <div className="flex flex-row">
            <div className="mx-6 overflow-hidden">
              <DyoExpandableText
                text={product.description}
                lineClamp={2}
                className="text-md text-light"
                modalTitle={product.name}
              />
            </div>

            <div className="flex flex-col flex-grow">
              <span className="self-end text-bright whitespace-nowrap ml-2">{utcDateToLocale(product.createdAt)}</span>

              <DyoTag className="ml-auto">{t(product.type).toUpperCase()}</DyoTag>
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
    </>
  )
}

export default ProductDetailsCard
