import DyoWrap from '@app/elements/dyo-wrap'
import EditInstanceCard from './instances/edit-instance-card'
import { DeploymentState } from './use-deployment-state'

export interface DeploymentViewTileProps {
  state: DeploymentState
}

const DeploymentViewTile = (props: DeploymentViewTileProps) => {
  const { state } = props

  return (
    <DyoWrap>
      {state.instances.map(it => (
        <EditInstanceCard key={it.id} instance={it} deploymentState={state} />
      ))}
    </DyoWrap>
  )
}

export default DeploymentViewTile
