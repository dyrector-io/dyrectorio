import DyoWrap from '@app/elements/dyo-wrap'
import { Instance } from '@app/models'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import EditInstanceCard from './instances/edit-instance-card'

export interface DeploymentViewTileProps {
  instances: Instance[]
  disabled?: boolean
  deploymentSock: WebSocketClientEndpoint
  publicKey?: string
  secretsList: { [instance: string]: string[] }
}

const DeploymentViewTile = (props: DeploymentViewTileProps) => {
  const { instances, disabled, deploymentSock, publicKey, secretsList } = props

  return (
    <DyoWrap>
      {instances.map(it => (
        <EditInstanceCard
          key={it.id}
          disabled={disabled}
          instance={it}
          deploymentSock={deploymentSock}
          publicKey={publicKey}
          definedSecrets={secretsList[it.id]}
        />
      ))}
    </DyoWrap>
  )
}

export default DeploymentViewTile
