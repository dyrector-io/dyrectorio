import ViewModeToggle, { ViewMode } from '@app/components/shared/view-mode-toggle'
import useWebSocket from '@app/hooks/use-websocket'
import {
  deploymentIsMutable,
  DeploymentRoot,
  GetInstanceMessage,
  ImageDeletedMessage,
  Instance,
  InstanceMessage,
  InstancesAddedMessage,
  InstanceUpdatedMessage,
  WS_TYPE_GET_INSTANCE,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_INSTANCE,
  WS_TYPE_INSTANCES_ADDED,
  WS_TYPE_INSTANCE_UPDATED,
} from '@app/models'
import { deploymentWsUrl } from '@app/routes'
import { useState } from 'react'
import DeploymentViewList from './deployment-view-list'
import DeploymentViewTile from './deployment-view-tile'

const mergeInstancePatch = (instance: Instance, message: InstanceUpdatedMessage): Instance => ({
  ...instance,
  overriddenConfig: {
    ...instance.overriddenConfig,
    ...message,
  },
})

interface EditDeploymentInstancesProps {
  deployment: DeploymentRoot
}

const EditDeploymentInstances = (props: EditDeploymentInstancesProps) => {
  const { deployment } = props

  const mutable = deploymentIsMutable(deployment.status)

  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])
  const [viewMode, setViewMode] = useState<ViewMode>('tile')

  const sock = useWebSocket(deploymentWsUrl(deployment.product.id, deployment.versionId, deployment.id))

  sock.on(WS_TYPE_INSTANCE_UPDATED, (message: InstanceUpdatedMessage) => {
    const index = instances.findIndex(it => it.id === message.instanceId)
    if (index < 0) {
      sock.send(WS_TYPE_GET_INSTANCE, {
        id: message.instanceId,
      } as GetInstanceMessage)
      return
    }

    const oldOne = instances[index]
    const instance = mergeInstancePatch(oldOne, message)

    const newInstances = [...instances]
    newInstances[index] = instance

    setInstances(newInstances)
  })

  sock.on(WS_TYPE_INSTANCE, (message: InstanceMessage) => setInstances([...instances, message]))

  sock.on(WS_TYPE_INSTANCES_ADDED, (message: InstancesAddedMessage) => setInstances([...instances, ...message]))

  sock.on(WS_TYPE_IMAGE_DELETED, (message: ImageDeletedMessage) =>
    setInstances(instances.filter(it => it.image.id !== message.imageId)),
  )

  return (
    <>
      <div className="flex flex-row justify-end mt-4">
        <ViewModeToggle viewMode={viewMode} onViewModeChanged={setViewMode} />
      </div>
      {viewMode === 'tile' ? (
        <DeploymentViewTile
          disabled={!mutable}
          instances={instances}
          deploymentSock={sock}
          publicKey={deployment?.publicKey}
        />
      ) : (
        <DeploymentViewList instances={instances} />
      )}
    </>
  )
}

export default EditDeploymentInstances
