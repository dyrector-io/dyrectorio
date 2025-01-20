import DyoWrap from '@app/elements/dyo-wrap'
import {
  concreteContainerConfigToJsonConfig,
  ContainerConfigParent,
  mergeJsonConfigToConcreteContainerConfig,
} from '@app/models'
import EditContainerConfigCard from '../container-configs/edit-container-config-card'
import { DeploymentState } from './use-deployment-state'

export type DeploymentViewTileProps = {
  state: DeploymentState
}

const DeploymentViewTile = (props: DeploymentViewTileProps) => {
  const { state } = props

  return (
    <DyoWrap>
      {state.instances.map(it => {
        const parent: ContainerConfigParent = {
          id: it.image.id,
          name: it.image.name,
          mutable: state.mutable,
        }

        return (
          <EditContainerConfigCard
            key={it.id}
            containerConfig={it.config}
            configParent={parent}
            image={it.image}
            convertConfigToJson={concreteContainerConfigToJsonConfig}
            mergeJsonWithConfig={mergeJsonConfigToConcreteContainerConfig}
          />
        )
      })}
    </DyoWrap>
  )
}

export default DeploymentViewTile
