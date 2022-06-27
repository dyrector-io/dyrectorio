import { DyoButton } from '@app/elements/dyo-button'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { VersionAddSectionState, VersionSectionsState } from './version-sections'

interface VersionSectionsHeadingProps {
  versionMutable: boolean
  state: VersionSectionsState
  onStateSelected: (state: VersionSectionsState) => void
  onAddStateSelected: (state: VersionAddSectionState) => void
  onSaveImageOrder: VoidFunction
  onDiscardImageOrder: VoidFunction
}

const VersionSectionsHeading = (props: VersionSectionsHeadingProps) => {
  const { t } = useTranslation('versions')

  const { versionMutable, state, onStateSelected, onAddStateSelected } = props

  const saveOrder = () => {
    props.onSaveImageOrder()
    onStateSelected('images')
  }

  const discardOrder = () => {
    props.onDiscardImageOrder()
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

            <DyoButton onClick={() => onAddStateSelected('deployment')}>{t('addDeployment')}</DyoButton>

            {versionMutable ? null : <DyoButton onClick={() => onAddStateSelected('image')}>{t('addImage')}</DyoButton>}
          </div>
        </>
      )}
    </div>
  )
}

export default VersionSectionsHeading
