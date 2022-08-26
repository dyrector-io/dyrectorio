import DyoWrap from '@app/elements/dyo-wrap'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { useRouter } from 'next/router'
import VersionCard from './versions/version-card'

interface ProductVersionsSectionProps {
  productId: string
  versions: Version[]
  onIncrease?: (version: Version) => void
  onSetAsDefault?: (version: Version) => void
  disabled?: boolean
}

const ProductVersionsSection = (props: ProductVersionsSectionProps) => {
  const { productId } = props

  const router = useRouter()

  const onClick = (versionId: string) => router.push(versionUrl(props.productId, versionId))

  return (
    <DyoWrap>
      {props.versions.map((it, index) => (
        <VersionCard
          key={`version-${index}`}
          productId={productId}
          version={it}
          onClick={() => onClick(it.id)}
          disabled={props.disabled}
          onIncreaseClick={props.onIncrease ? () => props.onIncrease(it) : null}
          onSetAsDefaultClick={props.onSetAsDefault ? () => props.onSetAsDefault(it) : null}
        />
      ))}
    </DyoWrap>
  )
}

export default ProductVersionsSection
