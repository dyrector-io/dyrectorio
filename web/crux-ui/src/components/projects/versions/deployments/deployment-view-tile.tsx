import DyoWrap from '@app/elements/dyo-wrap'
import EditInstanceCard from './instances/edit-instance-card'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

export interface DeploymentViewTileProps {
  state: DeploymentState
  actions: DeploymentActions
}

const DeploymentViewTile = (props: DeploymentViewTileProps) => {
  const { state, actions } = props

  return (
    <DyoWrap>
      {state.instances.map(it => (
        <EditInstanceCard key={it.id} instance={it} deploymentState={state} deploymentActions={actions} />
      ))}
    </DyoWrap>
  )
}

export default DeploymentViewTile
