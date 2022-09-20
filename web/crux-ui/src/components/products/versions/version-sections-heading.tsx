import DyoButton from '@app/elements/dyo-button'
import { VersionAddSectionState, VersionSectionsState } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface VersionSectionsHeadingProps {
  viewModeVisible: boolean
  viewMode: string
  versionMutable: boolean
  state: VersionSectionsState
  onStateSelected: (state: VersionSectionsState) => void
  onAddStateSelected: (state: VersionAddSectionState) => void
  onSaveImageOrder: VoidFunction
  onDiscardImageOrder: VoidFunction
  onViewModeChanged: (mode: string) => void
}

const VersionSectionsHeading = (props: VersionSectionsHeadingProps) => {
  const {
    versionMutable,
    state,
    viewModeVisible,
    viewMode,
    onStateSelected,
    onAddStateSelected,
    onSaveImageOrder,
    onDiscardImageOrder,
    onViewModeChanged,
  } = props

  const { t } = useTranslation('versions')

  const saveOrder = () => {
    onSaveImageOrder()
    onStateSelected('images')
  }

  const discardOrder = () => {
    onDiscardImageOrder()
    onStateSelected('images')
  }

  return (
    <div className="flex flex-row my-4">
      {state === 'reorder' ? (
        <>
          <DyoButton className="ml-auto px-4" secondary onClick={discardOrder}>
            {t('common:discard')}
          </DyoButton>

          <DyoButton className="px-4 ml-4" onClick={saveOrder}>
            {t('common:save')}
          </DyoButton>
        </>
      ) : (
        <>
          <DyoButton
            text
            thin
            underlined={state === 'images'}
            textColor="text-bright"
            className="mx-6"
            onClick={() => onStateSelected('images')}
          >
            {t('images')}
          </DyoButton>

          <DyoButton
            text
            thin
            underlined={state === 'deployments'}
            textColor="text-bright"
            className="ml-6"
            onClick={() => onStateSelected('deployments')}
          >
            {t('deployments')}
          </DyoButton>

          <div className="flex flex-row ml-auto">
            {versionMutable ? null : (
              <DyoButton text className="pl-10 pr-4" onClick={() => onStateSelected('reorder')}>
                {t('reorderImages')}
              </DyoButton>
            )}

            {versionMutable ? null : <DyoButton onClick={() => onAddStateSelected('image')}>{t('addImage')}</DyoButton>}

            <DyoButton onClick={() => onAddStateSelected('deployment')}>{t('addDeployment')}</DyoButton>

            {viewModeVisible && (
              <div className="px-1 bg-medium text-white font-semibold rounded cursor-pointer h-10 flex flex-row">
                <div
                  className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'tile' && 'bg-dyo-turquoise rounded')}
                  onClick={() => onViewModeChanged('tile')}
                >
                  <Image src="/view_tile.svg" width={18} height={18} />
                </div>
                <div
                  className={clsx('px-2 py-1.5 my-1 mr-0.5', viewMode === 'list' && 'bg-dyo-turquoise rounded')}
                  onClick={() => onViewModeChanged('list')}
                >
                  <Image src="/view_table.svg" width={18} height={18} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VersionSectionsHeading
