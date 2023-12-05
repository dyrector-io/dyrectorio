import DyoWrap from '@app/elements/dyo-wrap'
import { Project } from '@app/models'
import ProjectCard from './project-card'

export interface ProjectViewTileProps {
  projects: Project[]
}

const ProjectViewTile = (props: ProjectViewTileProps) => {
  const { projects } = props

  return (
    <DyoWrap>
      {projects.map((it, index) => (
        <ProjectCard className="max-h-72 p-8" key={`project-${index}`} project={it} />
      ))}
    </DyoWrap>
  )
}

export default ProjectViewTile
