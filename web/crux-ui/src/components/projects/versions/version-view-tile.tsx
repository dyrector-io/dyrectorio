import DyoWrap from '@app/elements/dyo-wrap'
import {
  ContainerConfigParent,
  containerConfigToJsonConfig,
  DeleteImageMessage,
  mergeJsonWithContainerConfig,
  VersionImage,
  WS_TYPE_DELETE_IMAGE,
} from '@app/models'
import clsx from 'clsx'
import EditContainerConfigCard from '../../container-configs/edit-container-config-card'
import { VerionState } from './use-version-state'

interface VersionViewTileProps {
  disabled?: boolean
  state: VerionState
}

const VersionViewTile = (props: VersionViewTileProps) => {
  const { disabled, state } = props

  const onDelete = (it: VersionImage) => {
    state.versionSock.send(WS_TYPE_DELETE_IMAGE, {
      imageId: it.id,
    } as DeleteImageMessage)
  }

  return (
    <DyoWrap itemClassName="xl:w-1/2 py-2">
      {state.version.images
        .sort((one, other) => one.order - other.order)
        .map((it, index) => {
          const parent: ContainerConfigParent = {
            id: it.id,
            name: it.name,
            mutable: !disabled,
          }

          return (
            <div className={clsx('w-full h-full', index % 2 ? 'xl:pl-2' : 'xl:pr-2')} key={it.order}>
              <EditContainerConfigCard
                containerConfig={it.config}
                configParent={parent}
                image={it}
                onDelete={() => onDelete(it)}
                convertConfigToJson={containerConfigToJsonConfig}
                mergeJsonWithConfig={mergeJsonWithContainerConfig}
              />
            </div>
          )
        })}
    </DyoWrap>
  )
}

export default VersionViewTile
