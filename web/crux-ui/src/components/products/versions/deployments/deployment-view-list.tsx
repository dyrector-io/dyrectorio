import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import { Instance } from '@app/models'
import { instanceConfigUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import { DeploymentState } from './use-deployment-state'

export interface DeploymentViewListProps {
  state: DeploymentState
}

const DeploymentViewList = (props: DeploymentViewListProps) => {
  const { state } = props
  const { instances } = state

  const { t } = useTranslation('images')

  const columnWidths = ['w-3/12', 'w-3/12', 'w-2/12', 'w-3/12', 'w-1/12']
  const headers = ['containerName', 'common:registry', 'imageTag', 'common:createdAt', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg text-right pr-4', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('text-right pr-4', defaultItemClass),
  ]

  const itemTemplate = (item: Instance) => [
    item.image.name,
    item.image.registryName,
    <div className="flex items-center">
      <span>
        {item.image.name}
        {item.image.tag ? `:${item.image.tag}` : null}
      </span>
    </div>,
    <span suppressHydrationWarning>{item.image.createdAt ? utcDateToLocale(item.image.createdAt) : 'new'}</span>,
    <Link href={instanceConfigUrl(state.product.id, state.version.id, state.deployment.id, item.id)} passHref>
      <Image src="/settings.svg" alt={t('common:settings')} width={24} height={24} />
    </Link>,
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
