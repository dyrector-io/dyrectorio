import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { catchError, lastValueFrom, map, of } from 'rxjs'
import TeamRepository from 'src/app/team/team.repository'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { CruxBadRequestException } from 'src/exception/crux-exception'
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
  constructor(
    private mapper: NotificationMapper,
    private prisma: PrismaService,
    private teamRepository: TeamRepository,
    private kratos: KratosService,
    private httpService: HttpService,
  ) {}

  async getNotifications(teamSlug: string): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        team: {
          slug: teamSlug,
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

  async createNotification(
    teamSlug: string,
    request: CreateNotificationDto,
    identity: Identity,
  ): Promise<NotificationDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const notification = await this.prisma.notification.create({
      data: {
        teamId,
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

    const success = await lastValueFrom(
      this.httpService.post(notification.url, { content: TEST_MESSAGE, text: TEST_MESSAGE }).pipe(
        map(it => it.status === 200),
        catchError(() => of(false)),
      ),
    )

    if (!success) {
      throw new CruxBadRequestException({
        message: 'Webhook test failed',
      })
    }
  }
}
