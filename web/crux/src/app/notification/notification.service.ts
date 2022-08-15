import { KratosService } from 'src/services/kratos.service'
import {
  IdRequest,
  UpdateNotificationRequest,
  UpdateEntityResponse,
  AccessRequest,
  NotificationListResponse,
  CreateNotificationResponse,
  NotificationDetailsResponse,
  Empty,
} from 'src/grpc/protobuf/proto/crux'
import { TeamRepository } from 'src/app/team/team.repository'
import { Injectable, Logger } from '@nestjs/common'
import { CreateNotificationRequest } from 'src/grpc/protobuf/proto/crux'
import { PrismaService } from 'src/services/prisma.service'
import { NotificationMapper } from './notification.mapper'
import { lastValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'

const TEST_MESSAGE = 'Its a test!'

@Injectable()
export class NotificationService {
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
      },
    })

    const identity = await this.kratos.getIdentityById(request.accessedBy)

    return this.mapper.toGrpcCreateResponse(notification, identity)
  }

  async updateNotification(request: UpdateNotificationRequest): Promise<UpdateEntityResponse> {
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
        updatedAt: new Date(),
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

    await lastValueFrom(
      this.httpService.post(notification.url, { content: TEST_MESSAGE, text: TEST_MESSAGE }),
    )

    return Empty;
  }
}
