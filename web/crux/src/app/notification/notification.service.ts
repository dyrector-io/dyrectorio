import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'
import TeamRepository from 'src/app/team/team.repository'
import { Empty } from 'src/grpc/protobuf/proto/common'
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  IdRequest,
  NotificationDetailsResponse,
  NotificationListResponse,
  UpdateEntityResponse,
  UpdateNotificationRequest,
} from 'src/grpc/protobuf/proto/crux'
import KratosService from 'src/services/kratos.service'
import PrismaService from 'src/services/prisma.service'
import { nameOrEmailOfIdentity } from 'src/shared/models'
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

  async createNotification(
    request: CreateNotificationRequest,
    accessedBy: string,
  ): Promise<CreateNotificationResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(accessedBy)

    const notification = await this.prisma.notification.create({
      data: {
        teamId: team.teamId,
        name: request.name,
        url: request.url,
        type: this.mapper.typeToDb(request.type),
        createdBy: accessedBy,
        active: !!request.active,
        events: {
          createMany: {
            data: (request.events ?? []).map(it => ({
              event: this.mapper.eventTypeToDb(it),
            })),
          },
        },
      },
    })

    const identity = await this.kratos.getIdentityById(accessedBy)

    return {
      id: notification.id,
      creator: nameOrEmailOfIdentity(identity),
    }
  }

  async updateNotification(request: UpdateNotificationRequest, accessedBy: string): Promise<UpdateEntityResponse> {
    const notificationEvents = await this.prisma.notificationEvent.findMany({
      where: {
        notificationId: request.id,
      },
    })

    const eventsDbMapped = (request.events ?? []).map(ev => this.mapper.eventTypeToDb(ev))
    const newEvents = eventsDbMapped.filter(event => !notificationEvents.find(it => it.event === event))
    const deleteEvents = notificationEvents.filter(event => !eventsDbMapped.find(it => event.event === it))

    const notification = await this.prisma.notification.update({
      where: {
        id: request.id,
      },
      data: {
        name: request.name,
        url: request.url,
        active: !!request.active,
        type: this.mapper.typeToDb(request.type),
        updatedBy: accessedBy,
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

    return UpdateEntityResponse.fromJSON(notification)
  }

  async deleteNotification(request: IdRequest): Promise<void> {
    await this.prisma.notification.delete({
      where: {
        id: request.id,
      },
    })
  }

  async getNotifications(accessedBy: string): Promise<NotificationListResponse> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: accessedBy,
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
    const identities = await this.kratos.getIdentitiesByIds(userIds)

    return {
      data: this.mapper.listToProto(notifications, identities),
    }
  }

  async getNotificationDetails(request: IdRequest, accessedBy: string): Promise<NotificationDetailsResponse> {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        events: true,
      },
    })

    const identity = await this.kratos.getIdentityById(accessedBy)

    return this.mapper.detailsToProto(notification, identity)
  }

  async testNotification(request: IdRequest): Promise<Empty> {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: {
        id: request.id,
      },
    })

    await lastValueFrom(this.httpService.post(notification.url, { content: TEST_MESSAGE, text: TEST_MESSAGE }))

    return Empty
  }
}
