import { DyoCard } from '@app/elements/dyo-card'
import DyoCheckbox from '@app/elements/dyo-checkbox'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Instance } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

export interface DeploymentViewListProps {
  state: DeploymentState
  actions: DeploymentActions
}

const DeploymentViewList = (props: DeploymentViewListProps) => {
  const { t } = useTranslation('images')
  const routes = useTeamRoutes()

  const { state, actions } = props
  const { instances, deployInstances } = state

  const columnWidths = ['w-12', 'w-4/12', 'w-2/12', 'w-2/12', 'w-4/12', 'w-28']
  const headers = [
    '',
    ...['containerName', 'common:registry', 'imageTag', 'common:createdAt', 'common:actions'].map(it => t(it)),
    '',
  ]
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const itemTemplate = (item: Instance) => [
    <DyoCheckbox
      checked={deployInstances.includes(item.id)}
      onCheckedChange={it => actions.onInstanceSelected(item.id, it)}
    />,
    item.config?.name ?? item.image.config.name,
    item.image.registry.name,
    <div className="flex items-center">
      <span>
        {item.image.name}
        {item.image.tag ? `:${item.image.tag}` : null}
      </span>
    </div>,
    <span suppressHydrationWarning>
      {item.image.createdAt ? utcDateToLocale(item.image.createdAt) : t('common:new')}
    </span>,
    <div>
      <div className="inline-block mr-2">
        <Link href={routes.project.versions(state.project.id).imageDetails(state.version.id, item.image.id)} passHref>
          <DyoIcon src="/image_config_icon.svg" alt={t('common:imageConfig')} size="md" />
        </Link>
      </div>
      <Link href={routes.deployment.instanceDetails(state.deployment.id, item.id)} passHref>
        <DyoIcon src="/instance_config_icon.svg" alt={t('common:instanceConfig')} size="md" />
      </Link>
    </div>,
  ]

  const headerBuilder = (header: string, index: number) =>
    index === 0 ? (
      <DyoCheckbox
        className="border-bright-muted"
        checked={state.instances.length === state.deployInstances.length}
        onCheckedChange={it => actions.onAllInstancesToggled(it)}
      />
    ) : (
      header
    )

  return (
    <DyoCard className="relative mt-4">
      <DyoList
        headers={headers}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={instances}
        noSeparator
        itemBuilder={itemTemplate}
        headerBuilder={headerBuilder}
      />
    </DyoCard>
  )
}

export default DeploymentViewList
