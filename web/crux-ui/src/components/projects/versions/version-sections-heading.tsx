import ViewModeToggle from '@app/components/shared/view-mode-toggle'
import DyoButton from '@app/elements/dyo-button'
import useTranslation from 'next-translate/useTranslation'
import { RefObject } from 'react'
import { ImagesActions, ImagesState } from './images/use-images-state'

interface VersionSectionsHeadingProps {
  saveImageOrderRef: RefObject<VoidFunction>
  versionMutable: boolean
  state: ImagesState
  actions: ImagesActions
}

const VersionSectionsHeading = (props: VersionSectionsHeadingProps) => {
  const { versionMutable, state, actions, saveImageOrderRef } = props

  const { t } = useTranslation('versions')

  return (
    <div className="flex flex-row my-4">
      {state.section === 'reorder' ? (
        <>
          <DyoButton className="ml-auto px-4" secondary onClick={() => actions.discardAddSection()}>
            {t('common:discard')}
          </DyoButton>

          <DyoButton className="px-4 ml-4" onClick={() => saveImageOrderRef.current()}>
            {t('common:save')}
          </DyoButton>
        </>
      ) : (
        <>
          <DyoButton
            text
            thin
            underlined={state.section === 'images'}
            textColor="text-bright"
            className="mx-6"
            onClick={() => actions.setSection('images')}
          >
            {t('images')}
          </DyoButton>

          <DyoButton
            text
            thin
            underlined={state.section === 'deployments'}
            textColor="text-bright"
            className="ml-6"
            onClick={() => actions.setSection('deployments')}
          >
            {t('deployments')}
          </DyoButton>

          <div className="flex flex-row ml-auto">
            {versionMutable ? null : (
              <DyoButton text className="pl-10 pr-4" onClick={() => actions.setSection('reorder')}>
                {t('reorderImages')}
              </DyoButton>
            )}

            {versionMutable ? null : (
              <DyoButton onClick={() => actions.selectAddSection('image')}>{t('addImage')}</DyoButton>
            )}

            <DyoButton onClick={() => actions.selectAddSection('deployment')}>
              {t('deployments:addDeployment')}
            </DyoButton>

            {state.section === 'images' && (
              <ViewModeToggle viewMode={state.viewMode} onViewModeChanged={actions.selectViewMode} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VersionSectionsHeading
