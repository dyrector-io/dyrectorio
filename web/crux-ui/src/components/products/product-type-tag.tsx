import DyoTag from '@app/elements/dyo-tag'
import { ProductType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface ProductTypeTagProps {
  className?: string
  type: ProductType
}

const ProductTypeTag = (props: ProductTypeTagProps) => {
  const { t } = useTranslation('products')

  return (
    <DyoTag className={props.className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(props.type).toUpperCase()}
    </DyoTag>
  )
}

export default ProductTypeTag
