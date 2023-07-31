import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { RegistryTypeEnum } from '@prisma/client'
import { IdentityTraits, emailOfIdentity, invitationExpired, nameOfIdentity } from 'src/domain/identity'
import { InviteMessage } from 'src/domain/notification-templates'
import {
  CruxConflictException,
  CruxInternalServerErrorException,
  CruxNotFoundException,
  CruxPreconditionFailedException,
} from 'src/exception/crux-exception'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'
import EmailService from 'src/mailer/email.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import EmailBuilder, { InviteTemplateOptions } from '../../builders/email.builder'
import AuditLoggerService from '../audit.logger/audit.logger.service'
import { CreateTeamDto, InviteUserDto, TeamDetailsDto, TeamDto, UpdateTeamDto, UpdateUserRoleDto } from './team.dto'
import TeamMapper, { TeamWithUsers } from './team.mapper'
import TeamRepository from './team.repository'
import { UserDto, UserMetaDto } from './user.dto'

const teamSlugFromCreateDto = (context: ExecutionContext) => {
  const dto = context.switchToHttp().getRequest() as CreateTeamDto
  return dto.slug
}

@Injectable()
export default class TeamService {
  private readonly logger = new Logger(TeamService.name)

  constructor(
    private teamRepository: TeamRepository,
    private prisma: PrismaService,
    private kratos: KratosService,
    private emailService: EmailService,
    private mapper: TeamMapper,
    private emailBuilder: EmailBuilder,
    private notificationService: DomainNotificationService,
    private auditLoggerService: AuditLoggerService,
  ) {}

  async getUserMeta(identity: Identity): Promise<UserMetaDto> {
    const teams = await this.prisma.usersOnTeams.findMany({
      where: {
        userId: identity.id,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    const invitations = await this.prisma.userInvitation.findMany({
      where: {
        userId: identity.id,
        status: 'pending',
      },
      select: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return this.mapper.toUserMetaDto(teams, invitations, identity)
  }

  async createTeam(request: CreateTeamDto, identity: Identity, context: ExecutionContext): Promise<TeamDto> {
    // Create Team entity in database
    const team = await this.prisma.team.create({
      data: {
        slug: request.slug.replace(/\s/g, ''), // remove whitespaces
        name: request.name,
        createdBy: identity.id,
        users: {
          create: {
            userId: identity.id,
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
            createdBy: identity.id,
            type: RegistryTypeEnum.hub,
          },
        },
      },
      include: this.teamRepository.teamInclude,
    })

    await this.auditLoggerService.createHttpAudit(teamSlugFromCreateDto, 'all', context)

    return this.mapper.toDto(team)
  }

  async updateTeam(teamId: string, request: UpdateTeamDto, identity: Identity): Promise<void> {
    await this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: request.name,
        slug: request.slug,
        updatedBy: identity.id,
      },
    })
  }

  async deleteTeam(teamId: string): Promise<void> {
    await this.prisma.team.delete({
      where: {
        id: teamId,
      },
    })
  }

  async updateUserRole(teamId: string, userId: string, req: UpdateUserRoleDto, identity: Identity): Promise<void> {
    await this.prisma.usersOnTeams.update({
      where: {
        userId_teamId: {
          teamId,
          userId,
        },
      },
      data: {
        role: req.role,
        team: {
          update: {
            updatedBy: identity.id,
          },
        },
      },
    })
  }

  async inviteUserToTeam(teamId: string, request: InviteUserDto, identity: Identity): Promise<UserDto> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: teamId,
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

    await this.prisma.userInvitation.create({
      data: {
        userId: user.id,
        teamId: team.id,
        email: request.email,
      },
    })

    await this.notificationService.sendNotification({
      teamId,
      messageType: 'invite',
      message: { subject: request.email, team: team.name, owner: identity } as InviteMessage,
    })

    return {
      id: user.id,
      email: emailOfIdentity(user),
      name: nameOfIdentity(user),
      role: 'user',
      status: 'pending',
      lastLogin: null,
    }
  }

  async reinviteUserToTeam(teamId: string, userId: string, identity: Identity): Promise<void> {
    const user = await this.kratos.getIdentityById(userId)
    const traits = user.traits as IdentityTraits

    await this.prisma.userInvitation.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })

    await this.inviteUserToTeam(
      teamId,
      {
        email: traits.email,
        firstName: traits.name?.first,
        lastName: traits.name?.last,
      },
      identity,
    )
  }

  async acceptTeamInvitation(teamId: string, identity: Identity): Promise<void> {
    const invite = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: identity.id,
          teamId,
        },
      },
    })

    const now = new Date().getTime()
    if (invitationExpired(invite.createdAt, now)) {
      await this.prisma.userInvitation.update({
        where: {
          userId_teamId: {
            userId: identity.id,
            teamId,
          },
        },
        data: {
          status: 'expired',
        },
      })

      throw new CruxPreconditionFailedException({
        message: 'Invitation link is expired. ',
        property: 'teamId',
        value: teamId,
      })
    }

    await this.prisma.$transaction(async prisma => {
      await prisma.usersOnTeams.create({
        data: {
          userId: invite.userId,
          teamId: invite.teamId,
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

      // TODO(m8): Fix auditlog
      // await prisma.auditLog.create({
      //   data: {
      //     ...this.auditHelper.mapServerCallToGrpcLog(request, call),
      //     userId: identity.id,
      //     teamId: request.id,
      //   },
      // })
    })
  }

  async declineTeamInvitation(teamId: string, identity: Identity): Promise<void> {
    const invitation = await this.prisma.userInvitation.findUniqueOrThrow({
      where: {
        userId_teamId: {
          userId: identity.id,
          teamId,
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

  async deleteUserFromTeam(teamId: string, userId: string): Promise<void> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: teamId,
      },
    })

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
    } catch (err) {
      const exception = PrismaErrorInterceptor.transformPrismaError(err)
      if (!(exception instanceof CruxNotFoundException)) {
        throw exception
      }
    }

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
    } catch (err) {
      const exception = PrismaErrorInterceptor.transformPrismaError(err)
      if (!(exception instanceof CruxNotFoundException)) {
        throw exception
      }
    }

    if (!deleted) {
      throw new CruxNotFoundException({
        message: 'User not found',
        property: 'userId',
        value: userId,
      })
    }
  }

  async leaveTeam(teamId: string, identity: Identity, context: ExecutionContext): Promise<void> {
    await this.auditLoggerService.createHttpAudit(teamSlugFromCreateDto, 'all', context)

    await this.deleteUserFromTeam(teamId, identity.id)
  }

  async getTeams(identity: Identity): Promise<TeamDto[]> {
    const teams = await this.prisma.team.findMany({
      where: {
        users: {
          some: {
            userId: identity.id,
          },
        },
      },
      include: this.teamRepository.teamInclude,
    })

    const userIds = teams.flatMap(it => it.users).map(it => it.userId)
    const identities = await this.kratos.getIdentitiesByIds(new Set(userIds))
    const sessions = await this.kratos.getSessionsByIds(userIds)

    return teams.map(it => this.mapper.detailsToDto(it, identities, sessions))
  }

  async getTeamById(teamId: string): Promise<TeamDetailsDto> {
    const team = await this.prisma.team.findUniqueOrThrow({
      where: {
        id: teamId,
      },
      include: this.teamRepository.teamInclude,
    })

    const userIds = team.users.map(it => it.userId)
    const identities = await this.kratos.getIdentitiesByIds(new Set(userIds))
    const sessions = await this.kratos.getSessionsByIds(userIds)

    return this.mapper.detailsToDto(team, identities, sessions)
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
        throw new CruxConflictException({
          message: 'User is already in the team',
          property: 'email',
        })
      }

      // Check if the user was ever logged in
      const sessions = await this.kratos.getSessionsById(user.id)
      hasSession = sessions.length > 0
    }

    // Build emailItem
    const invitation = !hasSession ? await this.kratos.createInvitation(user) : null
    const inviteTemplate: InviteTemplateOptions = {
      teamId: team.id,
      teamName: team.name,
      invitation,
    }

    const emailItem = this.emailBuilder.buildInviteEmail(traits.email, inviteTemplate)

    // Send email
    const mailSent = await this.emailService.sendEmail(emailItem)

    // Result
    if (!mailSent) {
      throw new CruxInternalServerErrorException({ message: 'Sending mail failed.' })
    }

    return user
  }

  async enableOnboarding(identity: Identity): Promise<void> {
    await this.kratos.enableOnboarding(identity.id)
  }

  async disableOnboarding(identity: Identity): Promise<void> {
    await this.kratos.disableOnboarding(identity.id)
  }
}
