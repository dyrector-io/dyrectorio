import DyoWrap from '@app/elements/dyo-wrap'
import { Product } from '@app/models'
import { productUrl } from '@app/routes'
import { useRouter } from 'next/router'
import ProductCard from './product-card'

export interface ProductViewTileProps {
  products: Product[]
}

const ProductViewTile = (props: ProductViewTileProps) => {
  const { products } = props

  const router = useRouter()

  const onNavigateToDetails = (id: string) => router.push(productUrl(id))

  return (
    <DyoWrap>
      {products.map((it, index) => (
        <ProductCard
          className="max-h-72 p-8"
          key={`product-${index}`}
          product={it}
          onClick={() => onNavigateToDetails(it.id)}
        />
      ))}
    </DyoWrap>
  )
}

export default ProductViewTile
