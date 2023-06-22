import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { ProjectTypeEnum, VersionTypeEnum } from '@prisma/client'
import PrismaService from 'src/services/prisma.service'
import { VERSIONLESS_PROJECT_VERSION_NAME } from 'src/shared/const'
import TeamRepository from '../team/team.repository'
import { CreateProjectDto, ProjectDetailsDto, ProjectListItemDto, UpdateProjectDto } from './project.dto'
import ProjectMapper from './project.mapper'

@Injectable()
export default class ProjectService {
  constructor(private teamRepository: TeamRepository, private prisma: PrismaService, private mapper: ProjectMapper) {}

  async getProjects(identity: Identity): Promise<ProjectListItemDto[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: identity.id,
              active: true,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })

    return projects.map(it => this.mapper.toDto(it))
  }

  async getProjectDetails(id: string): Promise<ProjectDetailsDto> {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        versions: {
          include: {
            children: true,
          },
        },
      },
    })

    const projectInProgressDeployments = await this.prisma.project.count({
      where: {
        id,
        versions: {
          some: {
            deployments: {
              some: {
                status: 'inProgress',
              },
            },
          },
        },
      },
    })

    return this.mapper.detailsToDto({ ...project, deletable: projectInProgressDeployments === 0 })
  }

  async createProject(request: CreateProjectDto, identity: Identity): Promise<ProjectListItemDto> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const project = await this.prisma.project.create({
      data: {
        name: request.name,
        description: request.description,
        type: request.type,
        teamId: team.teamId,
        createdBy: identity.id,
        versions:
          request.type === ProjectTypeEnum.versionless
            ? {
                create: {
                  name: VERSIONLESS_PROJECT_VERSION_NAME,
                  createdBy: identity.id,
                  type: VersionTypeEnum.rolling,
                  default: true,
                },
              }
            : undefined,
      },
    })

    return this.mapper.toDto(project)
  }

  async updateProject(id: string, req: UpdateProjectDto, identity: Identity): Promise<ProjectListItemDto> {
    const currentProject = await this.prisma.project.findUnique({
      select: {
        type: true,
      },
      where: {
        id,
      },
    })

    const project = await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        name: req.name,
        description: req.description,
        updatedBy: identity.id,
        versions:
          currentProject.type === ProjectTypeEnum.versionless
            ? {
                updateMany: {
                  data: {
                    changelog: req.changelog,
                  },
                  where: {
                    projectId: id,
                  },
                },
              }
            : undefined,
      },
    })

    return this.mapper.toDto(project)
  }

  async deleteProject(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: {
        id,
      },
    })
  }

  async convertProjectToVersioned(id: string): Promise<void> {
    await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        type: 'versioned',
      },
    })
  }
}
