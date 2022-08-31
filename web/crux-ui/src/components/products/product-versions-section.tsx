import DyoWrap from '@app/elements/dyo-wrap'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { useRouter } from 'next/router'
import VersionCard from './versions/version-card'

interface ProductVersionsSectionProps {
  productId: string
  versions: Version[]
  onIncrease?: (version: Version) => void
  disabled?: boolean
}

const ProductVersionsSection = (props: ProductVersionsSectionProps) => {
  const { productId, versions, onIncrease, disabled } = props

  const router = useRouter()

  const onClick = (versionId: string) => router.push(versionUrl(productId, versionId))

  return (
    <DyoWrap>
      {versions.map((it, index) => (
        <VersionCard
          key={`version-${index}`}
          productId={productId}
          version={it}
          onClick={() => onClick(it.id)}
          disabled={disabled}
          onIncreaseClick={onIncrease ? () => onIncrease(it) : null}
        />
      ))}
    </DyoWrap>
  )
}

export default ProductVersionsSection
