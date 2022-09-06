import DyoWrap from '@app/elements/dyo-wrap'
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
import EditInstanceCard from './instances/edit-instance-card'

const mergeInstancePatch = (instance: Instance, message: InstanceUpdatedMessage): Instance => ({
  ...instance,
  overriddenConfig: message,
})

interface EditDeploymentInstancesProps {
  deployment: DeploymentRoot
}

const EditDeploymentInstances = (props: EditDeploymentInstancesProps) => {
  const { deployment } = props

  const mutable = deploymentIsMutable(deployment.status)

  const [instances, setInstances] = useState<Instance[]>(deployment.instances ?? [])

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
    <DyoWrap>
      {instances.map(it => (
        <EditInstanceCard key={it.id} disabled={!mutable} instance={it} deploymentSock={sock} />
      ))}
    </DyoWrap>
  )
}

export default EditDeploymentInstances
