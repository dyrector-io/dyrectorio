import { DyoConfirmationModalConfig } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { FilterConfig, TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useWebSocket from '@app/hooks/use-websocket'
import {
  Container,
  ContainerCommandMessage,
  ContainerListMessage,
  ContainerOperation,
  containerPrefixNameOf,
  ContainerState,
  DeleteContainerMessage,
  DyoNodeDetails,
  WS_TYPE_CONTAINER_COMMAND,
  WS_TYPE_CONTAINER_STATUS_LIST,
  WS_TYPE_DELETE_CONTAINER,
  WS_TYPE_WATCH_CONTAINER_STATUS,
} from '@app/models'
import { nodeWsUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { PaginationSettings } from '../shared/paginator'
import useNodeState from './use-node-state'

export type NodeDetailsSection = 'editing' | 'containers'

export type ContainerTargetStates = { [key: string]: ContainerState } // containerName to targetState

export type NodeDetailsState = {
  section: NodeDetailsSection
  node: DyoNodeDetails
  containerTargetStates: ContainerTargetStates
  filters: FilterConfig<Container, TextFilter>
  pagination: PaginationSettings
  confirmationModal: DyoConfirmationModalConfig
}

export type NodeDetailsActions = {
  onNodeEdited: (node: DyoNodeDetails, shouldClose?: boolean) => void
  setEditing: (editing: boolean) => void
  setPagination: (pagination: PaginationSettings) => void
  onStartContainer: (container: Container) => void
  onStopContainer: (container: Container) => void
  onRestartContainer: (container: Container) => void
  onDeleteContainer: (container: Container) => void
}

export type NodeDetailsStateOptions = {
  node: DyoNodeDetails
}

const useNodeDetailsState = (options: NodeDetailsStateOptions): [NodeDetailsState, NodeDetailsActions] => {
  const { t } = useTranslation('common')

  const [section, setSection] = useState<NodeDetailsSection>('containers')
  const [node, setNode] = useNodeState(options.node)
  const [containerTargetStates, setContainertargetStates] = useState<ContainerTargetStates>({})
  const [pagination, setPagination] = useState<PaginationSettings>({
    pageNumber: 0,
    pageSize: 10,
  })
  const [confirmationModal, confirm] = useConfirmation()
  const filters = useFilters<Container, TextFilter>({
    initialData: [],
    filters: [
      textFilterFor<Container>(it => [
        it.id.name,
        it.id.prefix,
        it.state,
        it.imageName,
        it.imageTag,
        utcDateToLocale(it.date),
      ]),
    ],
  })

  const sock = useWebSocket(nodeWsUrl(node.id), {
    onOpen: () => sock.send(WS_TYPE_WATCH_CONTAINER_STATUS, {}),
  })

  sock.on(WS_TYPE_CONTAINER_STATUS_LIST, (message: ContainerListMessage) => {
    filters.setItems(message)

    const newTargetStates = {
      ...containerTargetStates,
    }
    message.forEach(container => {
      const { state } = container
      const name = containerPrefixNameOf(container.id)

      const targetState = containerTargetStates[name]
      if (targetState && targetState === state) {
        delete newTargetStates[name]
      }
    })

    if (Object.keys(newTargetStates).length !== Object.keys(containerTargetStates).length) {
      setContainertargetStates(newTargetStates)
    }
  })

  const onNodeEdited = (newNode: DyoNodeDetails, shouldClose?: boolean) => {
    if (shouldClose) {
      setSection('containers')
    }

    setNode(newNode)
  }

  const setEditing = (editing: boolean) => setSection(editing ? 'editing' : 'containers')

  const sendContainerCommand = (container: Container, operation: ContainerOperation) => {
    sock.send(WS_TYPE_CONTAINER_COMMAND, {
      container: container.id,
      operation,
    } as ContainerCommandMessage)
  }

  const setTargetStateFor = (container: Container, state: ContainerState) => {
    const newTargetStates = {
      ...containerTargetStates,
    }

    const name = containerPrefixNameOf(container.id)
    newTargetStates[name] = state
    setContainertargetStates(newTargetStates)
  }

  const onStartContainer = (container: Container) => {
    setTargetStateFor(container, 'running')
    sendContainerCommand(container, 'start')
  }

  const onStopContainer = (container: Container) => {
    setTargetStateFor(container, 'exited')
    sendContainerCommand(container, 'stop')
  }

  const onRestartContainer = (container: Container) => {
    setTargetStateFor(container, 'running')
    sendContainerCommand(container, 'restart')
  }

  const onDeleteContainer = async (container: Container) => {
    const confirmed = await confirm(null, {
      title: t('areYouSure'),
      description: t('areYouSureDeleteName', { name: containerPrefixNameOf(container.id) }),
      confirmText: t('delete'),
    })

    if (!confirmed) {
      return
    }

    sock.send(WS_TYPE_DELETE_CONTAINER, {
      id: container.id,
    } as DeleteContainerMessage)
  }

  return [
    {
      section,
      node,
      pagination,
      containerTargetStates,
      filters,
      confirmationModal,
    },
    {
      onNodeEdited,
      setEditing,
      setPagination,
      onStartContainer,
      onStopContainer,
      onRestartContainer,
      onDeleteContainer,
    },
  ]
}

export default useNodeDetailsState
