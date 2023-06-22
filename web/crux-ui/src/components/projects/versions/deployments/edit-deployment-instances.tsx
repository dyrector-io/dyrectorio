import ViewModeToggle from '@app/components/shared/view-mode-toggle'
import DeploymentViewList from './deployment-view-list'
import DeploymentViewTile from './deployment-view-tile'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

interface EditDeploymentInstancesProps {
  state: DeploymentState
  actions: DeploymentActions
}

const EditDeploymentInstances = (props: EditDeploymentInstancesProps) => {
  const { state, actions } = props
  const { viewMode } = state

  return (
    <>
      <div className="flex flex-row justify-end mt-4">
        <ViewModeToggle viewMode={viewMode} onViewModeChanged={actions.setViewMode} />
      </div>

      {viewMode === 'tile' ? (
        <DeploymentViewTile state={state} actions={actions} />
      ) : (
        <DeploymentViewList state={state} actions={actions} />
      )}
    </>
  )
}

export default EditDeploymentInstances
