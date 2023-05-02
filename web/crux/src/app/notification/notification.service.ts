import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { lastValueFrom } from 'rxjs'
import TeamRepository from 'src/app/team/team.repository'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import {
  CreateNotificationDto,
  NotificationDetailsDto,
  NotificationDto,
  UpdateNotificationDto,
} from './notification.dto'
import NotificationMapper from './notification.mapper'

const TEST_MESSAGE = 'Its a test!'

@Injectable()
export default class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private mapper: NotificationMapper,
    private prisma: PrismaService,
    private teamRepository: TeamRepository,
    private kratos: KratosService,
    private httpService: HttpService,
  ) {}

  async getNotifications(identity: Identity): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
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
        events: true,
      },
    })

    const userIds = notifications.map(r => r.createdBy)
    const identities = await this.kratos.getIdentitiesByIds(new Set(userIds))

    return notifications.map(it => this.mapper.toDto(it, identities.get(it.createdBy)))
  }

  async getNotificationDetails(id: string): Promise<NotificationDetailsDto> {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        events: true,
      },
    })

    const identity = await this.kratos.getIdentityById(notification.createdBy)

    return this.mapper.detailsToDto(notification, identity)
  }

  async createNotification(request: CreateNotificationDto, identity: Identity): Promise<NotificationDto> {
    const team = await this.teamRepository.getActiveTeamByUserId(identity.id)

    const notification = await this.prisma.notification.create({
      data: {
        teamId: team.teamId,
        name: request.name,
        url: request.url,
        type: request.type,
        createdBy: identity.id,
        active: !!request.active,
        events: {
          createMany: {
            data: (request.enabledEvents ?? []).map(it => ({
              event: this.mapper.eventTypeToDb(it),
            })),
          },
        },
      },
    })

    return this.mapper.toDto(notification, identity)
  }

  async updateNotification(id: string, request: UpdateNotificationDto, identity: Identity): Promise<NotificationDto> {
    const notificationEvents = await this.prisma.notificationEvent.findMany({
      where: {
        notificationId: id,
      },
    })

    const eventsDbMapped = (request.enabledEvents ?? []).map(ev => this.mapper.eventTypeToDb(ev))
    const newEvents = eventsDbMapped.filter(event => !notificationEvents.find(it => it.event === event))
    const deleteEvents = notificationEvents.filter(event => !eventsDbMapped.find(it => event.event === it))

    const notification = await this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        name: request.name,
        url: request.url,
        active: !!request.active,
        type: request.type,
        updatedBy: identity.id,
        events: {
          deleteMany: {
            id: {
              in: deleteEvents.map(ev => ev.id),
            },
          },
          createMany: {
            data: newEvents.map(it => ({
              event: it,
            })),
          },
        },
      },
    })

    return this.mapper.toDto(notification, identity)
  }

  async deleteNotification(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: {
        id,
      },
    })
  }

  async testNotification(id: string): Promise<void> {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: {
        id,
      },
    })

    await lastValueFrom(this.httpService.post(notification.url, { content: TEST_MESSAGE, text: TEST_MESSAGE }))
  }
}
