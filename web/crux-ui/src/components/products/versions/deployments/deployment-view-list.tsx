import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { Instance } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { DeploymentState } from './use-deployment-state'

export interface DeploymentViewListProps {
  state: DeploymentState
}

const DeploymentViewList = (props: DeploymentViewListProps) => {
  const { state } = props
  const { instances } = state

  const { t } = useTranslation('common')

  const columnWidths = ['w-3/12', 'w-9/12']
  const headers = ['image', 'container']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg pr-4', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-4', defaultItemClass),
  ]

  const itemTemplate = (item: Instance) => [
    <a>
      {item.image.name}
      {item.image.tag ? `:${item.image.tag}` : null}
    </a>,
    <a>{item.image.config.name}</a>,
  ]

  return (
    <DyoCard className="relative mt-4">
      <DyoList
        headers={[...headers.map(h => t(h)), '']}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={instances}
        noSeparator
        itemBuilder={itemTemplate}
      />
    </DyoCard>
  )
}

export default DeploymentViewList
