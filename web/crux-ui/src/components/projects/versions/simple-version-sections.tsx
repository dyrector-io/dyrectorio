import { ProjectDetails, VersionDetails } from '@app/models'
import { useRouter } from 'next/router'
import { useImagesState } from './images/use-images-state'
import VersionSections, { parseVersionSectionState } from './version-sections'

interface SimpleVersionSectionsProps {
  project: ProjectDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
  setTopBarContent: (node: React.ReactNode) => void
}

export const SimpleVersionSections = (props: SimpleVersionSectionsProps) => {
  const { project, version, setSaving, setTopBarContent } = props

  const router = useRouter()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')
  const [state, actions] = useImagesState({
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
