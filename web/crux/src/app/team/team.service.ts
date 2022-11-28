import { ServerUnaryCall } from '@grpc/grpc-js'
import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { RegistryTypeEnum } from '@prisma/client'
import { InviteMessage } from 'src/domain/notification-templates'
import {
  AlreadyExistsException,
  MailServiceException,
  NotFoundException,
  PreconditionFailedException,
} from 'src/exception/errors'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  AccessRequest,
  ActiveTeamDetailsResponse,
  AllTeamsResponse,
  CreateEntityResponse,
  CreateTeamRequest,
  DeleteUserFromTeamRequest,
  IdRequest,
  InviteUserRequest,
  ReinviteUserRequest,
  TeamDetailsResponse,
  UpdateTeamRequest,
  UpdateUserRoleInTeamRequest,
  UserMetaResponse,
  UserStatus,
} from 'src/grpc/protobuf/proto/crux'
import InterceptorGrpcHelperProvider from 'src/interceptors/helper.interceptor'
import EmailService from 'src/mailer/email.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import { IdentityTraits, invitationExpired } from 'src/shared/models'
import EmailBuilder, { InviteTemplateOptions } from '../../builders/email.builder'
import TeamMapper, { TeamWithUsers } from './team.mapper'
import TeamRepository from './team.repository'

@Injectable()
export default class TeamService {
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
        status: 'pending',
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

    const { team } = activeUserOnTeam
    const userIds = team.users.map(it => it.userId).concat(team.invitations.map(it => it.userId))
    const identities = await this.kratos.getIdentitiesByIds(userIds)
    const sessions = await this.kratos.getSessionsByIds(userIds)

    return this.mapper.activeTeamDetailsToGrpc(team, identities, sessions)
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
            imageNamePrefix: 'library',
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

  async updateUserRole(req: UpdateUserRoleInTeamRequest): Promise<Empty> {
    await this.prisma.usersOnTeams.update({
      where: {
        userId_teamId: {
          teamId: req.id,
          userId: req.userId,
        },
      },
      data: {
        role: this.mapper.roleToDb(req.role),
        team: {
          update: {
            updatedBy: req.accessedBy,
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
        users: true,
      },
    })

    const user = await this.getOrCreateIdentityAndSendInvite(team, {
      email: request.email,
      name: {
        first: request.firstName,
        last: request.lastName ?? undefined,
      },
    })

    const invite = await this.prisma.userInvitation.create({
      data: {
        userId: user.id,
        teamId: team.id,
        email: request.email,
      },
    })

    await this.notificationService.sendNotification({
      identityId: request.accessedBy,
      messageType: 'invite',
      message: { subject: request.email, team: team.name } as InviteMessage,
    })

    return CreateEntityResponse.fromJSON({
      id: invite.userId,
      createdAt: invite.createdAt,
    })
  }

  async reinviteUserToTeam(request: ReinviteUserRequest): Promise<CreateEntityResponse> {
    const user = await this.kratos.getIdentityById(request.userId)
    const traits = user.traits as IdentityTraits

    await this.prisma.userInvitation.delete({
      where: {
        userId_teamId: {
          userId: request.userId,
          teamId: request.id,
        },
      },
    })

    return await this.inviteUserToTeam({
      id: request.id,
      email: traits.email,
      firstName: traits.name?.first ?? '',
      lastName: traits.name?.last,
      accessedBy: request.accessedBy,
    })
  }

  async acceptTeamInvitation(request: IdRequest, call: ServerUnaryCall<IdRequest, Promise<void>>): Promise<void> {
    const invite = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: request.accessedBy,
          teamId: request.id,
        },
      },
    })

    const now = new Date().getTime()
    if (invitationExpired(invite.createdAt, now)) {
      await this.prisma.userInvitation.update({
        where: {
          userId_teamId: {
            userId: request.accessedBy,
            teamId: request.id,
          },
        },
        data: {
          status: 'expired',
        },
      })

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
          userId: invite.userId,
          teamId: invite.teamId,
          active: !userHasTeam,
          role: 'user',
        },
      })

      await prisma.userInvitation.delete({
        where: {
          userId_teamId_email: {
            userId: invite.userId,
            teamId: invite.teamId,
            email: invite.email,
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

  async declineTeamInvitation(request: IdRequest): Promise<void> {
    const invitation = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: request.accessedBy,
          teamId: request.id,
        },
      },
    })

    await this.prisma.userInvitation.update({
      where: {
        userId_teamId: {
          userId: invitation.userId,
          teamId: invitation.teamId,
        },
      },
      data: {
        status: 'declined',
      },
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

    const { userId } = request
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
      // eslint-disable-next-line no-empty
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
      // eslint-disable-next-line no-empty
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

    const userIds = teams.flatMap(it => it.users).map(it => it.userId)
    const identities = await this.kratos.getIdentitiesByIds(userIds)
    const sessions = await this.kratos.getSessionsByIds(userIds)

    return {
      data: teams.map(it => this.mapper.teamDetailsToGrpc(it, identities, sessions)),
    }
  }

  async getTeamById(request: IdRequest): Promise<TeamDetailsResponse> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: this.teamRepository.teamInclude,
    })

    const userIds = team.users.map(it => it.userId)
    const identities = await this.kratos.getIdentitiesByIds(userIds)
    const sessions = await this.kratos.getSessionsByIds(userIds)

    return this.mapper.teamDetailsToGrpc(team, identities, sessions)
  }

  private async getOrCreateIdentityAndSendInvite(team: TeamWithUsers, traits: IdentityTraits): Promise<Identity> {
    // Check if User exists
    let user = await this.kratos.getIdentityByEmail(traits.email)
    let hasSession = false

    if (!user) {
      user = await this.kratos.createUser(traits)
    } else {
      // Check if User is already in the Team
      const userOnTeam = team.users.find(it => it.userId === user.id)

      if (userOnTeam) {
        throw new AlreadyExistsException({
          message: 'User is already in the team',
          property: 'email',
        })
      }

      // Check if the user was ever logged in
      const sessions = await this.kratos.getSessionsById(user.id)
      hasSession = sessions.length > 0
    }

    // Build emailItem
    const recoveryLink = !hasSession ? await this.kratos.createRecoveryLink(user) : null
    const inviteTemplate: InviteTemplateOptions = {
      teamId: team.id,
      teamName: team.name,
      kratosRecoveryLink: recoveryLink,
    }

    const emailItem = this.emailBuilder.buildInviteEmail(traits.email, inviteTemplate)

    // Send email
    const mailSent = await this.emailService.sendEmail(emailItem)

    // Result
    if (!mailSent) {
      throw new MailServiceException()
    }

    return user
  }
}
