import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import { PackageVersionChain } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

type VersionChainListProps = {
  className?: string
  versionChains: PackageVersionChain[]
  onRemove: (chain: PackageVersionChain) => void
}

const VersionChainList = (props: VersionChainListProps) => {
  const { className, versionChains, onRemove } = props

  const { t } = useTranslation('packages')

  const itemTemplate = (chain: PackageVersionChain) =>
    /* eslint-disable react/jsx-key */
    [
      <DyoLabel>{chain.project.name}</DyoLabel>,
      <DyoLabel>{chain.earliest.name}</DyoLabel>,
      <div className="flex flex-row p-auto">
        <DyoLabel>{chain.latest.name}</DyoLabel>

        <DyoImgButton
          className="ml-auto"
          src="/trash-can.svg"
          alt={t('common:delete')}
          height={24}
          onClick={() => onRemove(chain)}
        />
      </div>,
    ]
  /* eslint-enable react/jsx-key */

  return (
    <DyoList
      className={className}
      data={versionChains}
      headers={['common:project', 'earliest', 'latest'].map(it => t(it))}
      itemBuilder={itemTemplate}
    />
  )
}

export default VersionChainList
