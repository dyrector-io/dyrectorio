import ContainerStatusTag from '@app/components/nodes/container-status-tag'
import { NodeDetailsActions, NodeDetailsState } from '@app/components/nodes/use-node-details-state'
import Paginator from '@app/components/shared/paginator'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoList } from '@app/elements/dyo-list'
import LoadingIndicator from '@app/elements/loading-indicator'
import { dateSort, enumSort, sortHeaderBuilder, stringSort, useSorting } from '@app/hooks/use-sorting'
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
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'

interface NodeContainersListProps {
  state: NodeDetailsState
  actions: NodeDetailsActions
  showHidden?: boolean
}

type ContainerSorting = 'name' | 'imageTag' | 'state' | 'reason' | 'createdAt'

const NodeContainersList = (props: NodeContainersListProps) => {
  const { state, actions, showHidden } = props
  const { containerItems } = state

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()

  const sorting = useSorting<Container, ContainerSorting>(containerItems, {
    initialField: 'createdAt',
    initialDirection: 'asc',
    sortFunctions: {
      name: stringSort,
      imageTag: stringSort,
      state: enumSort(CONTAINER_STATE_VALUES),
      reason: stringSort,
      createdAt: dateSort,
    },
    fieldGetters: {
      name: it => containerPrefixNameOf(it.id),
      imageTag: it => imageName(it.imageName, it.imageTag),
    },
  })

  const listItems = showHidden ? sorting.items : sorting.items.filter(it => !containerIsHidden(it))

  const headers = [
    'common:name',
    'images:imageTag',
    'common:state',
    'common:reason',
    'common:createdAt',
    'ports',
    'common:actions',
  ]

  const itemBuilder = (container: Container) => {
    const name = containerPrefixNameOf(container.id)
    const targetState = state.containerTargetStates[name]

    return [
      <span>{name}</span>,
      <span className="block overflow-hidden truncate">{imageName(container.imageName, container.imageTag)}</span>,
      <ContainerStatusTag className="inline-block" state={container.state} />,
      <span>{container.reason}</span>,
      <span>{utcDateToLocale(container.createdAt)}</span>,
      !container.ports ? null : (
        <span className="block overflow-hidden truncate">{containerPortsToString(container.ports)}</span>
      ),
      <div className="flex flex-wrap gap-1 justify-end items-center">
        {targetState ? (
          <LoadingIndicator />
        ) : (
          <>
            {containerIsRestartable(container.state) ? (
              <DyoImgButton
                src="/restart.svg"
                alt={t('restart')}
                height={24}
                onClick={() => actions.onRestartContainer(container)}
              />
            ) : (
              <DyoImgButton
                disabled={!containerIsStartable(container.state)}
                src="/start.svg"
                alt={t('start')}
                height={24}
                onClick={() => actions.onStartContainer(container)}
              />
            )}

            <DyoImgButton
              disabled={!containerIsStopable(container.state)}
              src="/stop.svg"
              alt={t('stop')}
              height={24}
              onClick={() => actions.onStopContainer(container)}
            />

            {container.state && (
              <Link href={routes.node.containerLog(state.node.id, container.id)} passHref>
                <DyoIcon className="align-bottom" src="/note.svg" alt={t('logs')} size="md" />
              </Link>
            )}

            <DyoImgButton
              src="/trash-can.svg"
              alt={t('common:delete')}
              height={24}
              onClick={() => actions.onDeleteContainer(container)}
            />
          </>
        )}
      </div>,
    ]
  }

  const columnWidths = ['w-2/12', 'w-3/12', 'w-1/12', 'w-1/12', '', '', 'w-40']
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

  return (
    <DyoCard className="mt-4">
      <DyoList
        headers={headers}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={listItems}
        itemBuilder={itemBuilder}
        headerBuilder={sortHeaderBuilder<Container, ContainerSorting>(
          sorting,
          {
            'common:name': 'name',
            'images:imageTag': 'imageTag',
            'common:state': 'state',
            'common:reason': 'reason',
            'common:createdAt': 'createdAt',
          },
          text => t(text),
        )}
        footer={
          <Paginator
            onChanged={actions.setContainerPagination}
            length={listItems.length}
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
