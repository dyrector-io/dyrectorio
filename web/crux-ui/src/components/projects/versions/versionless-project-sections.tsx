import { ProjectDetails, VersionDetails, WebSocketSaveState } from '@app/models'
import { useRouter } from 'next/router'
import { useImagesState } from './images/use-images-state'
import VersionSections, { parseVersionSectionState } from './version-sections'

interface VersionlessProjectSectionsProps {
  project: ProjectDetails
  version: VersionDetails
  setTopBarContent: (node: React.ReactNode) => void
  setSaveState: (saveState: WebSocketSaveState) => void
}

const VersionlessProjectSections = (props: VersionlessProjectSectionsProps) => {
  const { project, version, setTopBarContent, setSaveState } = props

  const router = useRouter()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')
  const [state, actions] = useImagesState({
    version,
    projectId: project.id,
    initialSection,
    setSaveState,
  })

  return <VersionSections project={project} state={state} actions={actions} setTopBarContent={setTopBarContent} />
}

export default VersionlessProjectSections
