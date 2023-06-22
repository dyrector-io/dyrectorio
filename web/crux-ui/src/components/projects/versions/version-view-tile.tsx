import DyoWrap from '@app/elements/dyo-wrap'
import clsx from 'clsx'
import EditImageCard from './images/edit-image-card'
import { VerionState, VersionActions } from './use-version-state'

interface VersionViewTileProps {
  disabled?: boolean
  state: VerionState
  actions: VersionActions
}

const VersionViewTile = (props: VersionViewTileProps) => {
  const { disabled, state, actions } = props

  return (
    <DyoWrap itemClassName="xl:w-1/2 py-2">
      {state.version.images
        .sort((one, other) => one.order - other.order)
        .map((it, index) => (
          <div className={clsx('w-full h-full', index % 2 ? 'xl:pl-2' : 'xl:pr-2')} key={it.order}>
            <EditImageCard disabled={disabled} image={it} imagesState={state} imagesActions={actions} />
          </div>
        ))}
    </DyoWrap>
  )
}

export default VersionViewTile
