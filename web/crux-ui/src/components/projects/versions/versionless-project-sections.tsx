import { ProjectDetails, VersionDetails } from '@app/models'
import { useRouter } from 'next/router'
import { useVersionState } from './use-version-state'
import VersionSections, { parseVersionSectionState } from './version-sections'

interface VersionlessProjectSectionsProps {
  project: ProjectDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
  setTopBarContent: (node: React.ReactNode) => void
}

const VersionlessProjectSections = (props: VersionlessProjectSectionsProps) => {
  const { project, version, setSaving, setTopBarContent } = props

  const router = useRouter()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')
  const [state, actions] = useVersionState({
    version,
    projectId: project.id,
    initialSection,
  })

  return (
    <VersionSections
      project={project}
      state={state}
      actions={actions}
      setSaving={setSaving}
      setTopBarContent={setTopBarContent}
    />
  )
}

export default VersionlessProjectSections
