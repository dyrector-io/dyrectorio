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
  const { instances, deployInstances, project, version, deployment } = state

  return (
    <DyoCard className="relative mt-4">
      <DyoTable data={instances} dataKey="id" initialSortColumn={4} initialSortDirection="asc">
        {dyoCheckboxColumn({
          allSelected: instances.length === deployInstances.length,
          selected: deployInstances,
          onAllChange: actions.onAllInstancesToggled,
          onChange: actions.onInstanceSelected,
        })}
        <DyoColumn
          header={t('containerName')}
          className="w-4/12"
          sortable
          sortField={(it: Instance) => it.config?.name ?? it.image.config.name}
          sort={sortString}
          body={(it: Instance) => it.config?.name ?? it.image.config.name}
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
          body={(it: Instance) => (it.image.createdAt ? utcDateToLocale(it.image.createdAt) : t('common:new'))}
        />
        <DyoColumn
          header={t('common:actions')}
          className="w-40 text-center"
          body={(it: Instance) => (
            <>
              <div className="inline-block mr-2">
                <Link href={routes.project.versions(project.id).imageDetails(version.id, it.image.id)} passHref>
                  <DyoIcon src="/image_config_icon.svg" alt={t('common:imageConfig')} size="md" />
                </Link>
              </div>
              <Link href={routes.deployment.instanceDetails(deployment.id, it.id)} passHref>
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
