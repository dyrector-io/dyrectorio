import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoWrap from '@app/elements/dyo-wrap'
import useConfirmation from '@app/hooks/use-confirmation'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
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

  const { t } = useTranslation('products')

  const router = useRouter()

  const onClick = (versionId: string) => router.push(versionUrl(props.productId, versionId))

  const [modalConfig, confirmSetAsDefault] = useConfirmation()

  const onSetAsDefaultClick = (version: Version) =>
    confirmSetAsDefault(() => props.onSetAsDefault(version), {
      description: t('setNameAsDefault', version),
    })

  return (
    <>
      <DyoWrap>
        {props.versions.map((it, index) => (
          <VersionCard
            key={`version-${index}`}
            productId={productId}
            version={it}
            onClick={() => onClick(it.id)}
            disabled={props.disabled}
            onIncreaseClick={props.onIncrease ? () => props.onIncrease(it) : null}
            onSetAsDefaultClick={props.onSetAsDefault ? () => onSetAsDefaultClick(it) : null}
          />
        ))}
      </DyoWrap>

      <DyoConfirmationModal config={modalConfig} title={t('common:areYouSure')} />
    </>
  )
}

export default ProductVersionsSection
