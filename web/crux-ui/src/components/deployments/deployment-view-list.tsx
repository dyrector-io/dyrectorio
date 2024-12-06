import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoTable, { DyoColumn, dyoCheckboxColumn, sortDate, sortString } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Instance, nameOfInstance } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
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

  return (
    <DyoCard className="relative mt-4">
      <DyoTable data={instances} dataKey="id" initialSortColumn={4} initialSortDirection="asc">
        {dyoCheckboxColumn({
          allSelected: instances.length === deployInstances.length,
          selected: deployInstances,
          onAllChange: actions.onAllInstancesToggled,
          onChange: actions.onInstanceSelected,
          qaLabel: 'instance',
        })}
        <DyoColumn
          header={t('containerName')}
          className="w-4/12"
          sortable
          sortField={nameOfInstance}
          sort={sortString}
          body={nameOfInstance}
        />
        <DyoColumn
          header={t('common:registry')}
          className="w-2/12"
          sortable
          sortField={(it: Instance) => it.image.registry.name}
          sort={sortString}
          body={(it: Instance) => it.image.registry.name}
        />
        <DyoColumn
          header={t('imageTag')}
          className="w-2/12"
          sortable
          sortField={(it: Instance) => (it.image.tag ? `${it.image.name}:${it.image.tag}` : it.image.name)}
          sort={sortString}
          body={(it: Instance) => (it.image.tag ? `${it.image.name}:${it.image.tag}` : it.image.name)}
        />
        <DyoColumn
          header={t('common:createdAt')}
          className="w-4/12"
          sortable
          sortField="image.createdAt"
          sort={sortDate}
          suppressHydrationWarning
          body={(it: Instance) => (it.image.createdAt ? utcDateToLocale(it.image.createdAt) : t('common:new'))}
        />
        <DyoColumn
          header={t('common:actions')}
          className="w-40 text-center"
          body={(it: Instance) => (
            <>
              <div className="inline-block mr-2">
                <DyoLink
                  href={routes.containerConfig.details(it.image.config.id)}
                  qaLabel="deployment-list-container-config-icon"
                >
                  <DyoIcon src="/container_config.svg" alt={t('common:imageConfig')} size="md" />
                </DyoLink>
              </div>

              <DyoLink
                href={routes.containerConfig.details(it.config.id)}
                qaLabel="deployment-list-instance-config-icon"
              >
                <DyoIcon src="/concrete_container_config.svg" alt={t('common:instanceConfig')} size="md" />
              </DyoLink>
            </>
          )}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default DeploymentViewList
