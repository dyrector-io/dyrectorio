import DyoCheckbox from '@app/elements/dyo-checkbox'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import { PackageVersionChain } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useState } from 'react'

type SelectableVersionChainListProps = {
  className?: string
  versionChains: PackageVersionChain[]
  onSelectionChange: (selection: PackageVersionChain[]) => void
}

const SelectableVersionChainList = (props: SelectableVersionChainListProps) => {
  const { className, versionChains, onSelectionChange } = props

  const { t } = useTranslation('packages')

  const [selected, setSelected] = useState<PackageVersionChain[]>([])
  const onCheckedChange = useCallback(
    (selectable: PackageVersionChain, checked: boolean) => {
      const newSelected = checked ? [...selected, selectable] : selected.filter(it => it.id !== selectable.id)
      setSelected(newSelected)
    },
    [selected],
  )

  const itemTemplate = (selectable: PackageVersionChain, index: number) => {
    const checked = !!selected.find(it => it.id === selectable.id)
    const onToggle = () => onCheckedChange(selectable, !checked)

    /* eslint-disable react/jsx-key */
    return [
      <div className="flex flex-row p-auto">
        <DyoCheckbox className="my-auto mr-2" checked={checked} onCheckedChange={onToggle} qaLabel={`chain-${index}`} />

        <DyoLabel onClick={onToggle}>{selectable.project.name}</DyoLabel>
      </div>,
      <DyoLabel onClick={onToggle}>{selectable.earliest.name}</DyoLabel>,
      <DyoLabel onClick={onToggle}>{selectable.latest.name}</DyoLabel>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <DyoList
      className={className}
      data={versionChains}
      headers={['common:project', 'earliest', 'latest'].map(it => t(it))}
      itemBuilder={itemTemplate}
    />
  )
}

export default SelectableVersionChainList
