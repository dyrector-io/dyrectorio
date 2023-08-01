import DyoWrap from '@app/elements/dyo-wrap'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Project } from '@app/models'
import ProjectCard from './project-card'

export interface ProjectViewTileProps {
  projects: Project[]
}

const ProjectViewTile = (props: ProjectViewTileProps) => {
  const { projects } = props

  const routes = useTeamRoutes()

  return (
    <DyoWrap>
      {projects.map((it, index) => (
        <ProjectCard
          className="max-h-72 p-8"
          key={`project-${index}`}
          project={it}
          titleHref={routes.project.details(it.id)}
        />
      ))}
    </DyoWrap>
  )
}

export default ProjectViewTile
