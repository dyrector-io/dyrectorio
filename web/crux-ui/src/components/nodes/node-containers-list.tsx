import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { NodeDetailsActions, NodeDetailsState } from '@app/components/nodes/use-node-details-state'
import Paginator from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoList } from '@app/elements/dyo-list'
import LoadingIndicator from '@app/elements/loading-indicator'
import {
  Container,
  containerIsRestartable,
  containerIsStartable,
  containerIsStopable,
  containerPortsToString,
  imageName,
} from '@app/models'
import { nodeContainerLogUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

interface NodeContainersListProps {
  state: NodeDetailsState
  actions: NodeDetailsActions
}

const NodeContainersList = (props: NodeContainersListProps) => {
  const { state, actions } = props
  const { pagination } = state
  const containers = state.filters.filtered

  const router = useRouter()

  const { t } = useTranslation('nodes')

  const headers = ['common:name', 'images:imageTag', 'common:state', 'common:createdAt', 'ports', 'common:actions']

  const navigateToLog = (container: Container) =>
    router.push(nodeContainerLogUrl(state.node.id, container.id, container.prefix, container.name))

  const itemBuilder = (container: Container) => {
    const targetState = state.containerTargetStates[container.name]

    return [
      <span>{container.name}</span>,
      <span className="block overflow-hidden truncate">{imageName(container.imageName, container.imageTag)}</span>,
      <ContainerStatusTag className="inline-block" state={container.state} />,
      <span>{utcDateToLocale(container.date)}</span>,
      !container.ports ? null : (
        <span className="block overflow-hidden truncate">{containerPortsToString(container.ports)}</span>
      ),
      <div className="flex flex-wrap gap-1 justify-center items-center">
        {targetState ? (
          <LoadingIndicator />
        ) : (
          <>
            {containerIsRestartable(container.state) ? (
              <DyoImgButton
                src="/restart.svg"
                alt="restart"
                height={24}
                onClick={() => actions.onRestartContainer(container)}
              />
            ) : (
              <DyoImgButton
                disabled={!containerIsStartable(container.state)}
                src="/start.svg"
                alt="start"
                height={24}
                onClick={() => actions.onStartContainer(container)}
              />
            )}

            <DyoImgButton
              disabled={!containerIsStopable(container.state)}
              src="/stop.svg"
              alt="stop"
              height={24}
              onClick={() => actions.onStopContainer(container)}
            />

            {container.state && (
              <DyoImgButton
                src="/note-text-outline.svg"
                alt="log"
                width={24}
                height={24}
                onClick={() => navigateToLog(container)}
              />
            )}

            <DyoImgButton
              src="/trash-can.svg"
              alt="delete"
              height={24}
              onClick={() => actions.onDeleteContainer(container)}
            />
          </>
        )}
      </div>,
    ]
  }

  const columnWidths = ['w-2/12', 'w-4/12', 'w-1/12', '', '', 'w-1/12']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg text-right pr-6', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-2', defaultItemClass),
  ]

  return (
    <DyoCard className="mt-4">
      <DyoList
        headers={[...headers.map(h => t(h))]}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={containers.slice(
          pagination.pageNumber * pagination.pageSize,
          pagination.pageNumber * pagination.pageSize + pagination.pageSize,
        )}
        itemBuilder={itemBuilder}
        footer={
          <Paginator
            onChanged={actions.setPagination}
            length={containers.length}
            defaultPagination={{
              pageNumber: 0,
              pageSize: 10,
            }}
          />
        }
      />
    </DyoCard>
  )
}

export default NodeContainersList
