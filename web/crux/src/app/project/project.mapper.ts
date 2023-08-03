import { Project } from '.prisma/client'
import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { BasicProperties } from 'src/shared/dtos/shared.dto'
import AuditMapper from '../audit/audit.mapper'
import VersionMapper, { VersionWithChildren } from '../version/version.mapper'
import { BasicProjectDto, ProjectDetailsDto, ProjectDto, ProjectListItemDto } from './project.dto'

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
