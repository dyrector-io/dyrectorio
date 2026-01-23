import useTeamRoutes from '@app/hooks/use-team-routes'
import useWebSocket from '@app/hooks/use-websocket'
import {
  Container,
  ContainersStateListMessage,
  Deployment,
  WatchContainerStatusMessage,
  WS_TYPE_CONTAINERS_STATE_LIST,
  WS_TYPE_WATCH_CONTAINERS_STATE,
} from '@app/models'
import { useState } from 'react'

const useNodeContainersState = (deployment: Pick<Deployment, 'id' | 'prefix' | 'node'>): Container[] | null => {
  const routes = useTeamRoutes()

  const [containers, setContainers] = useState<Container[] | null>(null)

  const sock = useWebSocket(routes.node.detailsSocket(deployment.node.id), {
    onOpen: () =>
      sock.send(WS_TYPE_WATCH_CONTAINERS_STATE, {
        prefix: deployment.prefix,
        deploymentId: deployment.id,
      } as WatchContainerStatusMessage),
  })

  sock.on(WS_TYPE_CONTAINERS_STATE_LIST, (message: ContainersStateListMessage) => {
    setContainers(message.containers)
  })

  return containers
}

export default useNodeContainersState
