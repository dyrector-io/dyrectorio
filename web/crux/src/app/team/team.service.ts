import { ServerUnaryCall } from '@grpc/grpc-js'
import { Injectable, Logger } from '@nestjs/common'
import { RegistryTypeEnum } from '@prisma/client'
import { InviteMessage } from 'src/domain/notification-templates'
import {
  AlreadyExistsException,
  MailServiceException,
  NotFoundException,
  PreconditionFailedException,
} from 'src/exception/errors'
import {
  AccessRequest,
  ActiveTeamDetailsResponse,
  AllTeamsResponse,
  CreateEntityResponse,
  CreateTeamRequest,
  DeleteUserFromTeamRequest,
  Empty,
  IdRequest,
  InviteUserRequest,
  TeamDetailsResponse,
  UpdateTeamRequest,
  UpdateUserRoleInTeamRequest,
  UserMetaResponse,
  UserStatus,
} from 'src/grpc/protobuf/proto/crux'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import { DomainNotificationService } from 'src/services/domain.notification.service'
import { EmailService } from 'src/services/email.service'
import { KratosService } from 'src/services/kratos.service'
import { PrismaService } from 'src/services/prisma.service'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import { EmailBuilder } from '../../builders/email.builder'
import { TeamMapper } from './team.mapper'
import { TeamRepository } from './team.repository'

const VALIDITY_DAY = 1
const EPOCH_TIME = 24 * 60 * 60 * 1000 // 1 day in millis

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name)

  constructor(
    private teamRepository: TeamRepository,
    private prisma: PrismaService,
    private kratos: KratosService,
    private emailService: EmailService,
    private mapper: TeamMapper,
    private auditHelper: InterceptorGrpcHelperProvider,
    private emailBuilder: EmailBuilder,
    private notificationService: DomainNotificationService,
  ) {}

  async getUserMeta(request: AccessRequest): Promise<UserMetaResponse> {
    const usersOnTeams = await this.prisma.usersOnTeams.findMany({
      where: {
        userId: request.accessedBy,
      },
      select: {
        active: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const invitations = await this.prisma.userInvitation.findMany({
      where: {
        userId: request.accessedBy,
      },
      select: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const active = usersOnTeams.find(it => it.active)

    return {
      user: !active
        ? null
        : {
            activeTeamId: active.team.id,
            role: this.mapper.roleToGrpc(active.role),
            status: UserStatus.VERIFIED,
          },
      teams: usersOnTeams.map(it => it.team),
      invitations: invitations.map(it => it.team),
    }
  }

  async getActiveTeamByUserId(request: AccessRequest): Promise<ActiveTeamDetailsResponse> {
    const activeUserOnTeam = await this.prisma.usersOnTeams.findFirstOrThrow({
      where: {
        userId: request.accessedBy,
        active: true,
      },
      select: {
        team: {
          include: {
            users: true,
            invitations: true,
          },
        },
      },
    })

    const team = activeUserOnTeam.team
    const userIds = team.users.map(it => it.userId).concat(team.invitations.map(it => it.userId))
    const identities = await this.kratos.getIdentitiesByIds(userIds)

    return this.mapper.activeTeamDetailsToGrpc(team, identities)
  }

  async createTeam(
    request: CreateTeamRequest,
    call: ServerUnaryCall<CreateTeamRequest, Promise<CreateEntityResponse>>,
  ): Promise<CreateEntityResponse> {
    // If the user doesn't have an active team, make the current one active
    const userHasTeam = await this.teamRepository.userHasTeam(request.accessedBy)

    // Create Team entity in database
    const team = await this.prisma.team.create({
      data: {
        name: request.name,
        createdBy: request.accessedBy,
        users: {
          create: {
            userId: request.accessedBy,
            active: !userHasTeam,
            role: 'owner',
          },
        },
        // Seed every team with the Docker Hub Registry
        registries: {
          create: {
            name: 'Docker Hub Library',
            description: 'List of Docker library images',
            icon: null,
            url: REGISTRY_HUB_URL,
            urlPrefix: 'library',
            createdBy: request.accessedBy,
            type: RegistryTypeEnum.hub,
          },
        },
        // Add audit log manually
        auditLog: {
          create: {
            ...this.auditHelper.mapServerCallToGrpcLog(request, call),
            userId: request.accessedBy,
          },
        },
      },
    })

    return CreateEntityResponse.fromJSON(team)
  }

  async updateTeam(request: UpdateTeamRequest): Promise<Empty> {
    await this.prisma.team.update({
      where: {
        id: request.id,
      },
      data: {
        name: request.name,
        updatedBy: request.accessedBy,
        updatedAt: new Date(),
      },
    })

    return Empty
  }

  async deleteTeam(request: IdRequest): Promise<Empty> {
    const teamWithActiveUsers = await this.prisma.team.findFirst({
      where: {
        id: request.id,
        users: {
          some: {
            active: true,
          },
        },
      },
      select: {
        users: {
          select: {
            userId: true,
          },
        },
      },
    })

    await this.prisma.$transaction(async prisma => {
      await prisma.team.delete({
        where: {
          id: request.id,
        },
      })

      if (teamWithActiveUsers) {
        const userIds = teamWithActiveUsers.users.map(it => it.userId)

        const userOnTeams = await prisma.usersOnTeams.findMany({
          where: {
            userId: {
              in: userIds,
            },
          },
          select: {
            teamId: true,
            userId: true,
          },
        })

        const updatables: Record<string, string> = userOnTeams.reduce((result, it) => {
          result[it.userId] = it.teamId
          return result
        }, {})

        const updates = Object.entries(updatables).map(async entry => {
          const [key, value] = entry

          return await prisma.usersOnTeams.update({
            where: {
              userId_teamId: {
                userId: key,
                teamId: value,
              },
            },
            data: {
              active: true,
            },
          })
        })

        await Promise.all(updates)
      }
    })

    return Empty
  }

  async updateUserRole(request: UpdateUserRoleInTeamRequest): Promise<Empty> {
    await this.prisma.usersOnTeams.update({
      where: {
        userId_teamId: {
          teamId: request.id,
          userId: request.userId,
        },
      },
      data: {
        role: this.mapper.roleToDb(request.role),
        team: {
          update: {
            updatedBy: request.accessedBy,
            updatedAt: new Date(),
          },
        },
      },
    })

    return Empty
  }

  async inviteUserToTeam(request: InviteUserRequest): Promise<CreateEntityResponse> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        users: {
          select: {
            userId: true,
          },
        },
      },
    })

    // Check if User exists
    let user = await this.kratos.getIdentityByEmail(request.email)
    let hasSession = false

    if (!user) {
      user = await this.kratos.createUser(request.email)
    } else {
      // Check if User is already in the Team
      const userOnTeam = team.users.find(it => it.userId === user.id)

      if (userOnTeam) {
        throw new AlreadyExistsException({
          message: `User is already in the team`,
          property: 'email',
        })
      }

      // Check if the user was ever logged in
      const sessions = await this.kratos.getSessionsById(user.id)
      hasSession = sessions.length > 0
    }

    // Build emailItem
    const teamId = hasSession ? team.id : null
    const recoveryLink = !hasSession ? await this.kratos.createRecoveryLink(user) : null
    const emailItem = this.emailBuilder.buildInviteEmail(request.email, team.name, teamId, recoveryLink)

    // Send email
    const mailSent = await this.emailService.sendEmail(emailItem)

    // Result
    if (!mailSent) {
      throw new MailServiceException()
    }

    await this.notificationService.sendNotification({
      identityId: request.accessedBy,
      messageType: 'invite',
      message: { subject: request.email, team: team.name } as InviteMessage,
    })

    const invite = await this.prisma.userInvitation.create({
      data: {
        userId: user.id,
        teamId: team.id,
        email: request.email,
      },
    })

    return CreateEntityResponse.fromJSON({
      id: invite.userId,
      createdAt: invite.createdAt,
    })
  }

  async acceptTeamInvite(request: IdRequest, call: ServerUnaryCall<IdRequest, Promise<void>>): Promise<void> {
    // Check User invite is valid
    const userInvite = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: request.accessedBy,
          teamId: request.id,
        },
      },
    })

    // Add one extra day to CreatedAt
    const validUntil = new Date(userInvite.createdAt.getTime() + VALIDITY_DAY * EPOCH_TIME)
    const rightNowTime = new Date().getTime()

    // TECHDEBT Outsource the Date checker function
    if (rightNowTime >= validUntil.getTime()) {
      throw new PreconditionFailedException({
        message: 'Invitation link is expired. ',
        property: 'teamId',
        value: request.id,
      })
    }

    const userHasTeam = await this.teamRepository.userHasTeam(request.accessedBy)

    await this.prisma.$transaction(async prisma => {
      await prisma.usersOnTeams.create({
        data: {
          userId: userInvite.userId,
          teamId: userInvite.teamId,
          active: !userHasTeam,
          role: 'user',
        },
      })

      await prisma.userInvitation.delete({
        where: {
          userId_teamId_email: {
            userId: userInvite.userId,
            teamId: userInvite.teamId,
            email: userInvite.email,
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          ...this.auditHelper.mapServerCallToGrpcLog(request, call),
          userId: request.accessedBy,
          teamId: request.id,
        },
      })
    })
  }

  async selectTeam(request: IdRequest): Promise<void> {
    await this.prisma.usersOnTeams.updateMany({
      where: {
        userId: request.accessedBy,
      },
      data: {
        active: false,
      },
    })

    await this.prisma.usersOnTeams.update({
      where: {
        userId_teamId: {
          userId: request.accessedBy,
          teamId: request.id,
        },
      },
      data: {
        active: true,
      },
    })
  }

  async deleteUserFromTeam(request: DeleteUserFromTeamRequest): Promise<void> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: request.id,
      },
    })

    const userId = request.userId
    let deleted = false

    try {
      await this.prisma.userInvitation.delete({
        where: {
          userId_teamId: {
            teamId: team.id,
            userId,
          },
        },
      })
      deleted = true
    } catch {} // ignored

    try {
      await this.prisma.usersOnTeams.delete({
        where: {
          userId_teamId: {
            teamId: team.id,
            userId,
          },
        },
      })
      deleted = true
    } catch {} // ignored

    if (!deleted) {
      throw new NotFoundException({
        message: 'User not found',
        property: 'userId',
        value: userId,
      })
    }
  }

  async getAllTeams(request: AccessRequest): Promise<AllTeamsResponse> {
    const teams = await this.prisma.team.findMany({
      where: {
        users: {
          some: {
            userId: request.accessedBy,
          },
        },
      },
      include: this.teamRepository.teamInclude,
    })

    const identities = await this.kratos.getIdentitiesByIds(teams.flatMap(it => it.users).map(it => it.userId))

    return {
      data: teams.map(it => this.mapper.teamDetailsToGrpc(it, identities)),
    }
  }

  async getTeamById(request: IdRequest): Promise<TeamDetailsResponse> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: this.teamRepository.teamInclude,
    })

    const identities = await this.kratos.getIdentitiesByIds(team.users.map(it => it.userId))

    return this.mapper.teamDetailsToGrpc(team, identities)
  }
}
