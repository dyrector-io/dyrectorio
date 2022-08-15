import { EmailBuilder } from '../../builders/email.builder'
import { ServerUnaryCall } from '@grpc/grpc-js'
import { Injectable, Logger } from '@nestjs/common'
import { RegistryTypeEnum } from '@prisma/client'
import { PrismaService } from 'src/services/prisma.service'
import {
  AlreadyExistsException,
  MailServiceException,
  NotFoundException,
  PermissionDeniedException,
  PreconditionFailedException,
} from 'src/exception/errors'
import { InterceptorGrpcHelperProvider } from 'src/interceptors/helper.interceptor'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateTeamRequest,
  Empty,
  IdRequest,
  TeamDetailsResponse,
  UpdateActiveTeamRequest,
  UserInviteRequest,
  UserMetaResponse,
  UserRole,
  UserStatus,
} from 'src/grpc/protobuf/proto/crux'
import { TeamMapper } from './team.mapper'
import { TeamRepository } from './team.repository'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import { KratosService } from 'src/services/kratos.service'
import { EmailService } from 'src/services/email.service'
import { DomainNotificationService } from 'src/services/domain.notification.service'
import { InviteMessage } from 'src/domain/notification-templates'

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
        owner: true,
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
            role: active.owner ? UserRole.OWNER : UserRole.USER,
            status: UserStatus.VERIFIED,
          },
      teams: usersOnTeams.map(it => it.team),
      invitations: invitations.map(it => it.team),
    }
  }

  async getActiveTeamByUserId(request: AccessRequest): Promise<TeamDetailsResponse> {
    const activeUserOnTeam = await this.prisma.usersOnTeams.findFirst({
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
    const userIds: string[] = team.users.map(it => it.userId).concat(team.invitations.map(it => it.userId))
    const identities = await this.kratos.getIdentitiesByIds(userIds)

    return this.mapper.detailsToGrpc(team, identities)
  }

  async createTeam(
    request: CreateTeamRequest,
    call: ServerUnaryCall<CreateTeamRequest, Promise<CreateEntityResponse>>,
  ): Promise<CreateEntityResponse> {
    const userHasTeam = await this.teamRepository.userHasTeam(request.accessedBy)

    // If user doesn't has team, make the current one to active
    const active = !userHasTeam

    // Create Team entity in database
    const team = await this.prisma.team.create({
      data: {
        name: request.name,
        createdBy: request.accessedBy,
        users: {
          create: {
            userId: request.accessedBy,
            active,
            owner: true,
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

  async updateActiveTeam(request: UpdateActiveTeamRequest): Promise<Empty> {
    const team = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)

    await this.prisma.team.update({
      where: {
        id: team.teamId,
      },
      data: {
        ...request,
      },
    })

    return Empty
  }

  async deleteActiveTeam(request: AccessRequest): Promise<void> {
    const team = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)

    await this.prisma.team.delete({
      where: {
        id: team.teamId,
      },
    })
  }

  async inviteUserToTheActiveTeam(request: UserInviteRequest): Promise<CreateEntityResponse> {
    const userOnTeam = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)

    if (!userOnTeam.owner) {
      throw new PermissionDeniedException({
        message: 'User is not Admin on the given team',
      })
    }

    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: userOnTeam.teamId,
      },
    })

    // Check if User exists
    let user = await this.kratos.getIdentityByEmail(request.email)
    let hasSession = false

    if (!user) {
      user = await this.kratos.createUser(request.email)
    } else {
      // Check if User is already in the Team
      const invitedUserOnTeam = await this.prisma.usersOnTeams.findUnique({
        where: {
          userId_teamId: {
            userId: user.id,
            teamId: team.id,
          },
        },
      })

      if (invitedUserOnTeam) {
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
      message:  { subject: request.email, team: team.name } as InviteMessage,
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
    let activeTeam = false

    if (!userHasTeam) {
      activeTeam = true
    }

    await this.prisma.$transaction(async prisma => {
      await prisma.usersOnTeams.create({
        data: {
          userId: userInvite.userId,
          teamId: userInvite.teamId,
          active: activeTeam,
          owner: false,
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

  async deleteUserFromTeam(request: IdRequest): Promise<void> {
    const team = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)
    const userId = request.id
    let deleted = false

    try {
      await this.prisma.userInvitation.delete({
        where: {
          userId_teamId: {
            teamId: team.teamId,
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
            teamId: team.teamId,
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
}
