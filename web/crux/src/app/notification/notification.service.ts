import KratosService from 'src/services/kratos.service'
import {
  IdRequest,
  UpdateNotificationRequest,
  UpdateEntityResponse,
  AccessRequest,
  NotificationListResponse,
  CreateNotificationResponse,
  NotificationDetailsResponse,
  CreateNotificationRequest,
} from 'src/grpc/protobuf/proto/crux'
import { Empty } from 'src/grpc/protobuf/proto/common'
import TeamRepository from 'src/app/team/team.repository'
import { Injectable, Logger } from '@nestjs/common'
import PrismaService from 'src/services/prisma.service'
import { lastValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
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

  async createNotification(request: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    const team = await this.teamRepository.getActiveTeamByUserId(request.accessedBy)

    const notification = await this.prisma.notification.create({
      data: {
        teamId: team.teamId,
        name: request.name,
        url: request.url,
        type: this.mapper.typeToDb(request.type),
        createdBy: request.accessedBy,
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

    const identity = await this.kratos.getIdentityById(request.accessedBy)

    return this.mapper.toGrpcCreateResponse(notification, identity)
  }

  async updateNotification(request: UpdateNotificationRequest): Promise<UpdateEntityResponse> {
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
        updatedBy: request.accessedBy,
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

  async getNotifications(request: AccessRequest): Promise<NotificationListResponse> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        team: {
          users: {
            some: {
              userId: request.accessedBy,
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
      data: this.mapper.toGrpcListResponse(notifications, identities),
    }
  }

  async getNotificationDetails(request: IdRequest): Promise<NotificationDetailsResponse> {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: {
        id: request.id,
      },
      include: {
        events: true,
      },
    })

    const identity = await this.kratos.getIdentityById(request.accessedBy)

    return this.mapper.detailsToGrpc(notification, identity)
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
