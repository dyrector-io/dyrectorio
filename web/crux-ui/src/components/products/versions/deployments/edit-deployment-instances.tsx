import DyoWrap from '@app/elements/dyo-wrap'
import { useWebSocket } from '@app/hooks/use-websocket'
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

interface EditDeploymentInstancesProps {
  deployment: DeploymentRoot
}

const EditDeploymentInstances = (props: EditDeploymentInstancesProps) => {
  const { deployment } = props

  const mutable = deploymentIsMutable(deployment.status)

  const [instances, setInstances] = useState(deployment.instances ?? [])

  const sock = useWebSocket(deploymentWsUrl(deployment.product.id, deployment.versionId, deployment.id))

  sock.on(WS_TYPE_INSTANCE, (message: InstanceMessage) => {
    setInstances([...instances, message])
  })

  sock.on(WS_TYPE_INSTANCE_UPDATED, (message: InstanceUpdatedMessage) => {
    const index = instances.findIndex(it => it.id === message.instanceId)
    if (index < 0) {
      sock.send(WS_TYPE_GET_INSTANCE, {
        id: message.instanceId,
      } as GetInstanceMessage)
      return
    }

    const oldOne = instances[index]
    const image = mergeInstancePatch(oldOne, message)

    const newInstances = [...instances]
    newInstances[index] = image

    setInstances(newInstances)
  })

  sock.on(WS_TYPE_INSTANCE, (message: InstanceMessage) => setInstances([...instances, message]))

  sock.on(WS_TYPE_INSTANCES_ADDED, (message: InstancesAddedMessage) => setInstances([...instances, ...message]))

  sock.on(WS_TYPE_IMAGE_DELETED, (message: ImageDeletedMessage) =>
    setInstances(instances.filter(it => it.image.id !== message.imageId)),
  )

  return (
    <DyoWrap>
      {instances.map(it => {
        return <EditInstanceCard disabled={!mutable} key={it.id} instance={it} deploymentSock={sock} />
      })}
    </DyoWrap>
  )
}

export default EditDeploymentInstances

export const mergeInstancePatch = (oldOne: Instance, newOne: InstanceUpdatedMessage) => {
  return {
    ...oldOne,
    ...newOne,
    config: {
      environment: newOne.environment ?? oldOne.config?.environment,
      capabilities: newOne.capabilities ?? oldOne.config?.capabilities,
      config: newOne.config ?? oldOne.config?.config,
    },
  }
}
