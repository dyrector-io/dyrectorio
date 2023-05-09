import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { RegistryTypeEnum } from '@prisma/client'
import { Request as ExpressRequest } from 'express'
import { IdentityTraits, emailOfIdentity, invitationExpired, nameOfIdentity } from 'src/domain/identity'
import { InviteMessage } from 'src/domain/notification-templates'
import {
  CruxConflictException,
  CruxInternalServerErrorException,
  CruxNotFoundException,
  CruxPreconditionFailedException,
} from 'src/exception/crux-exception'
import EmailService from 'src/mailer/email.service'
import DomainNotificationService from 'src/services/domain.notification.service'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { REGISTRY_HUB_URL } from 'src/shared/const'
import EmailBuilder, { InviteTemplateOptions } from '../../builders/email.builder'
import AuditLoggerService from '../shared/audit.logger.service'
import {
  ActivateTeamDto,
  CreateTeamDto,
  InviteUserDto,
  TeamDetailsDto,
  TeamDto,
  UpdateTeamDto,
  UpdateUserRoleDto,
} from './team.dto'
import TeamMapper, { TeamWithUsers } from './team.mapper'
import TeamRepository from './team.repository'
import { UserDto, UserMetaDto } from './user.dto'

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

  async checkUserActiveTeam(teamId: string, identity: Identity): Promise<boolean> {
    const userOnTeam = await this.teamRepository.getActiveTeamByUserId(identity.id)
    return userOnTeam.teamId === teamId
  }

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
          },
        },
      },
    })

    return this.mapper.toUserMetaDto(teams, invitations, identity)
  }

  async createTeam(request: CreateTeamDto, identity: Identity, httpRequest: ExpressRequest): Promise<TeamDto> {
    // If the user doesn't have an active team, make the current one active
    const userHasTeam = await this.teamRepository.userHasTeam(identity.id)

    // Create Team entity in database
    const team = await this.prisma.team.create({
      data: {
        name: request.name,
        createdBy: identity.id,
        users: {
          create: {
            userId: identity.id,
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
            createdBy: identity.id,
            type: RegistryTypeEnum.hub,
          },
        },
      },
      include: this.teamRepository.teamInclude,
    })

    await this.auditLoggerService.createHttpAudit('all', identity, httpRequest)

    return this.mapper.toDto(team)
  }

  async updateTeam(teamId: string, request: UpdateTeamDto, identity: Identity): Promise<void> {
    await this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name: request.name,
        updatedBy: identity.id,
      },
    })
  }

  async deleteTeam(teamId: string): Promise<void> {
    const teamWithActiveUsers = await this.prisma.team.findFirst({
      where: {
        id: teamId,
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
          id: teamId,
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
      identityId: identity.id,
      messageType: 'invite',
      message: { subject: request.email, team: team.name } as InviteMessage,
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

    const userHasTeam = await this.teamRepository.userHasTeam(identity.id)

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

  async activateTeam(req: ActivateTeamDto, identity: Identity): Promise<void> {
    await this.prisma.$transaction(async prisma => {
      await prisma.usersOnTeams.updateMany({
        where: {
          userId: identity.id,
        },
        data: {
          active: false,
        },
      })

      await prisma.usersOnTeams.update({
        where: {
          userId_teamId: {
            userId: identity.id,
            teamId: req.teamId,
          },
        },
        data: {
          active: true,
        },
      })
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
      // TODO(@polaroi8d): remove this catch or implement a better way to handle this
    } catch {
      this.logger.error(`User ${userId} is not in the team: ${team.id}`)
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
      // TODO(@polaroi8d): remove this catch or implement a better way to handle this
    } catch {
      this.logger.error(`User ${userId} is not in the team: ${team.id}`)
    }

    if (!deleted) {
      throw new CruxNotFoundException({
        message: 'User not found',
        property: 'userId',
        value: userId,
      })
    }
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
}
