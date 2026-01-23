import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoTable, { DyoColumn, dyoCheckboxColumn, sortNumber, sortString } from '@app/elements/dyo-table'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Instance, containerNameOfInstance, imageNameOf } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import { useCallback } from 'react'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

export interface DeploymentViewListProps {
  state: DeploymentState
  actions: DeploymentActions
}

const DeploymentViewList = (props: DeploymentViewListProps) => {
  const { t } = useTranslation('images')
  const routes = useTeamRoutes()

  const { state, actions } = props
  const { instances, containers, selectedInstanceIds: deployInstances } = state

  const containerForInstance = useCallback(
    (instance: Instance) => {
      if (!containers) {
        return null
      }

      const containerName = containerNameOfInstance(instance)
      return containers.find(it => it.id.name === containerName) ?? null
    },
    [containers],
  )

  const imageNameTagOf: (instance: Instance) => [string, string] = useCallback(
    (instance: Instance) => {
      const { image } = instance

      const container = containerForInstance(instance)
      if (!container || container.imageTag === image.tag) {
        return [imageNameOf(image), null]
      }

      return [`${image.name}:${container.imageTag}`, image.tag]
    },
    [containerForInstance],
  )

  return (
    <DyoCard className="relative mt-4">
      <DyoTable data={instances} dataKey="id" initialSortColumn={1} initialSortDirection="asc">
        {dyoCheckboxColumn({
          allSelected: instances.length === deployInstances.length,
          selected: deployInstances,
          onAllChange: actions.onAllInstancesToggled,
          onChange: actions.onInstanceSelected,
          qaLabel: 'instance',
        })}
        <DyoColumn
          className="w-1/12"
          header={t('common:order')}
          sortField="image.order"
          sortable
          sort={sortNumber}
          body={data => `#${data.image.order + 1}`}
        />
        <DyoColumn
          header={t('containerName')}
          className="w-4/12"
          sortable
          sortField={containerNameOfInstance}
          sort={sortString}
          body={containerNameOfInstance}
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
          className="w-3/12"
          sortable
          sortField={(it: Instance) => {
            const [imageNameTag, newTag] = imageNameTagOf(it)
            return `${imageNameTag} -> ${newTag}`
          }}
          sort={sortString}
          body={(it: Instance) => {
            const [imageNameTag, newTag] = imageNameTagOf(it)
            return (
              <div className="flex flex-row">
                <span>{imageNameTag}</span>

                {newTag && (
                  <>
                    <DyoIcon className="mx-1" src="/arrow_right.svg" alt={t('newTag')} size="md" />
                    <span className="text-dyo-turquoise ml">{newTag}</span>
                  </>
                )}
              </div>
            )
          }}
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
