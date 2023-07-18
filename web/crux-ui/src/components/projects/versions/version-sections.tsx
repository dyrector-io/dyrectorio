import EditorBadge from '@app/components/editor/editor-badge'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ProjectDetails, VERSION_SECTIONS_STATE_VALUES } from '@app/models'
import { parseStringUnionType } from '@app/utils'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useRef } from 'react'
import AddDeploymentCard from './deployments/add-deployment-card'
import CopyDeploymentCard from './deployments/copy-deployment-card'
import SelectImagesCard from './images/select-images-card'
import { VerionState, VersionActions, VersionSection } from './use-version-state'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

export const parseVersionSectionState = (section: string, fallback: VersionSection) =>
  parseStringUnionType(section, fallback, VERSION_SECTIONS_STATE_VALUES)

interface VersionSectionsProps {
  project: ProjectDetails
  state: VerionState
  actions: VersionActions
  setTopBarContent: (node: React.ReactNode) => void
}

const VersionSections = (props: VersionSectionsProps) => {
  const { state, actions, setTopBarContent, project } = props

  const routes = useTeamRoutes()
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

  const onDeploymentCreated = async (deploymentId: string) => await router.push(routes.deployment.details(deploymentId))

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
      ) : state.addSection === 'deployment' ? (
        <AddDeploymentCard
          className="mb-4 p-8"
          projectName={project.name}
          versionId={state.version.id}
          onAdd={onDeploymentCreated}
          onDiscard={actions.discardAddSection}
        />
      ) : (
        <CopyDeploymentCard
          className="mb-4 p-8"
          deployment={state.copyDeploymentTarget}
          onDeplyomentCopied={onDeploymentCreated}
          onDiscard={actions.discardAddSection}
        />
      )}

      {state.section === 'images' ? (
        <VersionImagesSection disabled={!state.version.mutable} state={state} actions={actions} />
      ) : state.section === 'deployments' ? (
        <VersionDeploymentsSection version={state.version} actions={actions} />
      ) : (
        <VersionReorderImagesSection
          images={state.version.images}
          saveRef={saveImageOrderRef}
          onSave={actions.orderImages}
        />
      )}
    </>
  )
}

export default VersionSections
