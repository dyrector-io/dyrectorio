import ViewModeToggle from '@app/components/shared/view-mode-toggle'
import DyoButton from '@app/elements/dyo-button'
import useTranslation from 'next-translate/useTranslation'
import { RefObject } from 'react'
import { VerionState, VersionActions } from './use-version-state'

interface VersionSectionsHeadingProps {
  saveImageOrderRef: RefObject<VoidFunction>
  versionMutable: boolean
  state: VerionState
  actions: VersionActions
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
            {state.section === 'images' ? (
              <>
                {versionMutable && (
                  <>
                    <DyoButton text className="pl-10 pr-4" onClick={() => actions.updateTagsToLatest()}>
                      {t('updateTags')}
                    </DyoButton>

                    <DyoButton text className="px-4" onClick={() => actions.setSection('reorder')}>
                      {t('reorderImages')}
                    </DyoButton>

                    <DyoButton onClick={() => actions.selectAddSection('image')}>{t('addImage')}</DyoButton>
                  </>
                )}

                <ViewModeToggle viewMode={state.viewMode} onViewModeChanged={actions.selectViewMode} />
              </>
            ) : (
              <DyoButton onClick={() => actions.selectAddSection('deployment')}>
                {t('deployments:addDeployment')}
              </DyoButton>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VersionSectionsHeading
