import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Instance } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { DeploymentActions, DeploymentState } from './use-deployment-state'
import DyoTable, { DyoColumn, dyoCheckboxColumn, sortDate, sortString } from '@app/elements/dyo-table'

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
      <DyoTable data={instances} initialSortColumn={4} initialSortDirection="asc">
        {dyoCheckboxColumn({
          allSelected: state.instances.length === state.deployInstances.length,
          selected: state.deployInstances,
          onAllChange: actions.onAllInstancesToggled,
          onChange: actions.onInstanceSelected,
        })}
        <DyoColumn
          header={t('containerName')}
          sortable
          sortField={(it: Instance) => it.config?.name ?? it.image.config.name}
          sort={sortString}
          body={(it: Instance) => it.config?.name ?? it.image.config.name}
        />
        <DyoColumn
          header={t('common:registry')}
          sortable
          sortField={(it: Instance) => it.image.registry.name}
          sort={sortString}
          body={(it: Instance) => it.image.registry.name}
        />
        <DyoColumn
          header={t('imageTag')}
          sortable
          sortField={(it: Instance) => (it.image.tag ? `${it.image.name}:${it.image.tag}` : it.image.name)}
          sort={sortString}
          body={(it: Instance) => (it.image.tag ? `${it.image.name}:${it.image.tag}` : it.image.name)}
        />
        <DyoColumn
          header={t('common:createdAt')}
          sortable
          sortField="image.createdAt"
          sort={sortDate}
          body={(it: Instance) => (it.image.createdAt ? utcDateToLocale(it.image.createdAt) : t('common:new'))}
        />
        <DyoColumn
          header={t('common:actions')}
          width="10%"
          align="center"
          body={(it: Instance) => (
            <>
              <div className="inline-block mr-2">
                <Link
                  href={routes.project.versions(state.project.id).imageDetails(state.version.id, it.image.id)}
                  passHref
                >
                  <DyoIcon src="/image_config_icon.svg" alt={t('common:imageConfig')} size="md" />
                </Link>
              </div>
              <Link href={routes.deployment.instanceDetails(state.deployment.id, it.id)} passHref>
                <DyoIcon src="/instance_config_icon.svg" alt={t('common:instanceConfig')} size="md" />
              </Link>
            </>
          )}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default DeploymentViewList
