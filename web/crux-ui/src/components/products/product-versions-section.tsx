import DyoWrap from '@app/elements/dyo-wrap'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { useRouter } from 'next/router'
import React from 'react'
import VersionCard from './versions/version-card'

interface ProductVersionsSectionProps {
  productId: string
  versions: Version[]
  onIncrease: (version: Version) => void
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
          onIncreaseClick={() => props.onIncrease(it)}
        />
      ))}
    </DyoWrap>
  )
}

export default ProductVersionsSection
