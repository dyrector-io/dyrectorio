import DyoWrap from '@app/elements/dyo-wrap'
import { Product } from '@app/models'
import { productUrl } from '@app/routes'
import ProductCard from './product-card'

export interface ProductViewTileProps {
  products: Product[]
}

const ProductViewTile = (props: ProductViewTileProps) => {
  const { products } = props
  return (
    <DyoWrap>
      {products.map((it, index) => (
        <ProductCard className="max-h-72 p-8" key={`product-${index}`} product={it} titleHref={productUrl(it.id)} />
      ))}
    </DyoWrap>
  )
}

export default ProductViewTile
