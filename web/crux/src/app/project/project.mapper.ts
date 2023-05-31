import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { Project } from '.prisma/client'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { ProjectListItemDto, ProjectDetailsDto, ProjectDto, BasicProjectDto } from './project.dto'
import AuditMapper from '../audit/audit.mapper'

@Injectable()
export default class ProjectMapper {
  constructor(
    @Inject(forwardRef(() => VersionMapper))
    private versionMapper: VersionMapper,
    private auditMapper: AuditMapper,
  ) {}

  toDto(it: Project): ProjectDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
      audit: this.auditMapper.toDto(it),
      description: it.description,
    }
  }

  toBasicDto(it: Pick<Project, BasicProperties>): BasicProjectDto {
    return {
      id: it.id,
      name: it.name,
      type: it.type,
    }
  }

  toListItemDto(it: ProjectWithCount): ProjectListItemDto {
    return {
      ...this.toDto(it),
      versionCount: it._count.versions,
    }
  }

  detailsToDto(project: ProjectWithVersions): ProjectDetailsDto {
    return {
      ...this.toDto(project),
      deletable: project.deletable,
      versions: project.versions.map(it => this.versionMapper.toDto(it)),
    }
  }
}

type ProjectWithVersions = Project & {
  versions: VersionWithChildren[]
  deletable: boolean
}

export type ProjectWithCount = Project & {
  _count: {
    versions: number
  }
}
