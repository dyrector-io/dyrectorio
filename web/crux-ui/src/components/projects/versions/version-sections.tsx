import EditorBadge from '@app/components/editor/editor-badge'
import { ProjectDetails, VERSION_SECTIONS_STATE_VALUES } from '@app/models'
import { deploymentUrl } from '@app/routes'
import { parseStringUnionType } from '@app/utils'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useRef } from 'react'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
import { ImagesActions, ImagesState, VersionSection } from './images/use-images-state'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

export const parseVersionSectionState = (section: string, fallback: VersionSection) =>
  parseStringUnionType(section, fallback, VERSION_SECTIONS_STATE_VALUES)

interface VersionSectionsProps {
  project: ProjectDetails
  state: ImagesState
  actions: ImagesActions
  setTopBarContent: (node: React.ReactNode) => void
}

const VersionSections = (props: VersionSectionsProps) => {
  const { state, actions, setTopBarContent, project } = props

  const router = useRouter()

  const { editors } = state.editor

  useEffect(() => {
    const reactNode = (
      <>
        {editors.map((it, index) => (
          <EditorBadge key={index} className="mr-2" editor={it} />
        ))}
      </>
    )

    setTopBarContent(reactNode)
  }, [editors, setTopBarContent])

  const saveImageOrderRef = useRef<VoidFunction>()

  const onAddDeployment = async (deploymentId: string) => await router.push(deploymentUrl(deploymentId))

  return (
    <>
      {state.addSection === 'none' ? (
        <VersionSectionsHeading
          versionMutable={!state.version.mutable}
          state={state}
          actions={actions}
          saveImageOrderRef={saveImageOrderRef}
        />
      ) : state.addSection === 'image' ? (
        <SelectImagesCard onImagesSelected={actions.addImages} onDiscard={actions.discardAddSection} />
      ) : (
        <AddDeploymentCard
          className="mb-4 p-8"
          projectName={project.name}
          versionId={state.version.id}
          onAdd={onAddDeployment}
          onDiscard={actions.discardAddSection}
        />
      )}

      {state.section === 'images' ? (
        <VersionImagesSection disabled={!state.version.mutable} state={state} actions={actions} />
      ) : state.section === 'deployments' ? (
        <VersionDeploymentsSection version={state.version} />
      ) : (
        <VersionReorderImagesSection images={state.images} saveRef={saveImageOrderRef} onSave={actions.orderImages} />
      )}
    </>
  )
}

export default VersionSections
