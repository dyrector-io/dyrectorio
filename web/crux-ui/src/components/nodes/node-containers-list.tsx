import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { NodeDetailsActions, NodeDetailsState } from '@app/components/nodes/use-node-details-state'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoLink from '@app/elements/dyo-link'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortString } from '@app/elements/dyo-table'
import LoadingIndicator from '@app/elements/loading-indicator'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  CONTAINER_STATE_VALUES,
  Container,
  containerIsHidden,
  containerIsRestartable,
  containerIsStartable,
  containerIsStopable,
  containerPortsToString,
  containerPrefixNameOf,
  imageName,
} from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

interface NodeContainersListProps {
  state: NodeDetailsState
  actions: NodeDetailsActions
  showHidden?: boolean
}

const NodeContainersList = (props: NodeContainersListProps) => {
  const { state, actions, showHidden } = props
  const { containerFilters } = state
  const { filtered: items } = containerFilters

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()

  const listItems = showHidden ? items : items.filter(it => !containerIsHidden(it))

  return (
    <DyoCard className="mt-4">
      <DyoTable data={listItems} pagination="client" initialSortColumn={4} initialSortDirection="asc">
        <DyoColumn
          header={t('common:name')}
          className="w-2/12"
          body={(it: Container) => containerPrefixNameOf(it.id)}
          sortable
          sortField={(it: Container) => containerPrefixNameOf(it.id)}
          sort={sortString}
        />
        <DyoColumn
          header={t('images:imageTag')}
          className="w-3/12"
          sortable
          sortField={(it: Container) => imageName(it.imageName, it.imageTag)}
          sort={sortString}
          bodyClassName="overflow-hidden truncate"
          body={(it: Container) => (
            <span title={imageName(it.imageName, it.imageTag)}>{imageName(it.imageName, it.imageTag)}</span>
          )}
        />
        <DyoColumn
          header={t('common:state')}
          className="w-1/12 text-center"
          sortable
          sortField="state"
          sort={sortEnum(CONTAINER_STATE_VALUES)}
          body={(it: Container) => <ContainerStatusTag className="inline-block" state={it.state} />}
        />
        <DyoColumn header={t('common:reason')} field="reason" className="w-1/12" sortable sort={sortString} />
        <DyoColumn
          header={t('common:createdAt')}
          sortable
          sortField="createdAt"
          sort={sortDate}
          suppressHydrationWarning
          body={(it: Container) => utcDateToLocale(it.createdAt)}
        />
        <DyoColumn
          header={t('ports')}
          body={(it: Container) =>
            !it.ports ? null : <span className="overflow-hidden truncate">{containerPortsToString(it.ports)}</span>
          }
        />
        <DyoColumn
          header={t('common:actions')}
          className="w-40 text-center"
          bodyClassName="flex flex-wrap gap-1 justify-center items-center"
          body={(it: Container) => {
            const name = containerPrefixNameOf(it.id)
            const targetState = state.containerTargetStates[name]
            if (targetState) {
              return <LoadingIndicator />
            }

            return (
              <>
                {containerIsRestartable(it.state) ? (
                  <DyoImgButton
                    src="/restart.svg"
                    alt={t('restart')}
                    height={24}
                    onClick={() => actions.onRestartContainer(it)}
                  />
                ) : (
                  <DyoImgButton
                    disabled={!containerIsStartable(it.state)}
                    src="/start.svg"
                    alt={t('start')}
                    height={24}
                    onClick={() => actions.onStartContainer(it)}
                  />
                )}

                <DyoImgButton
                  disabled={!containerIsStopable(it.state)}
                  src="/stop.svg"
                  alt={t('stop')}
                  height={24}
                  onClick={() => actions.onStopContainer(it)}
                />

                {it.state && (
                  <DyoLink href={routes.node.containerLog(state.node.id, it.id)} qaLabel="container-list-logs-icon">
                    <DyoIcon className="align-bottom" src="/note.svg" alt={t('logs')} size="md" />
                  </DyoLink>
                )}

                <DyoImgButton
                  src="/trash-can.svg"
                  alt={t('common:delete')}
                  height={24}
                  onClick={() => actions.onDeleteContainer(it)}
                />
              </>
            )
          }}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default NodeContainersList
