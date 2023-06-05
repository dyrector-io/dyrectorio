import { Audit } from './audit'
import { Version } from './version'

export const PROJECT_TYPE_VALUES = ['versionless', 'versioned'] as const
export type ProjectType = typeof PROJECT_TYPE_VALUES[number]

export type BasicProject = {
  id: string
  name: string
  type: ProjectType
}

export type Project = BasicProject & {
  description?: string
  versionCount?: number
  audit: Audit
}

export type EditableProject = Project & {
  changelog?: string
}

export type ProjectDetails = Project & {
  deletable: boolean
  versions: Version[]
}

export type UpdateProject = {
  name: string
  description?: string
  changelog?: string
}

export type CreateProject = UpdateProject & {
  type: ProjectType
}

export const projectDetailsToEditableProject = (project: ProjectDetails) =>
  ({
    ...project,
    changelog: project.type === 'versionless' ? project.versions[0].changelog : null,
  } as EditableProject)

export const updateProjectDetailsWithEditableProject = (project: ProjectDetails, edit: EditableProject) => {
  const newProject = {
    ...project,
    ...edit,
  }

  if (project.type === 'versionless') {
    const version = project.versions[0]

    newProject.versions = [
      {
        ...version,
        changelog: edit.changelog,
      },
    ]
  }

  return newProject
}
