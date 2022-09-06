import DyoTag from '@app/elements/dyo-tag'
import { ProductType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface ProductTypeTagProps {
  className?: string
  type: ProductType
}

const ProductTypeTag = (props: ProductTypeTagProps) => {
  const { className, type } = props

  const { t } = useTranslation('products')

  return (
    <DyoTag className={className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(type).toUpperCase()}
    </DyoTag>
  )
}

export default ProductTypeTag
