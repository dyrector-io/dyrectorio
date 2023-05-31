import DyoWrap from '@app/elements/dyo-wrap'
import { Project } from '@app/models'
import { projectUrl } from '@app/routes'
import ProjectCard from './project-card'

export interface ProjectViewTileProps {
  projects: Project[]
}

const ProjectViewTile = (props: ProjectViewTileProps) => {
  const { projects } = props
  return (
    <DyoWrap>
      {projects.map((it, index) => (
        <ProjectCard className="max-h-72 p-8" key={`project-${index}`} project={it} titleHref={projectUrl(it.id)} />
      ))}
    </DyoWrap>
  )
}

export default ProjectViewTile
