import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { filter, Observable, Subject } from 'rxjs'
import {
  DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE,
  DEPLOYMENT_EVENT_INSTACE_CREATE,
  DEPLOYMENT_EVENT_INSTACE_DELETE,
  DeploymentConfigBundlesUpdatedEvent,
  DeploymentEditEvent,
  IMAGE_EVENT_ADD,
  IMAGE_EVENT_DELETE,
  ImageDeletedEvent,
  ImagesAddedEvent,
  InstanceDeletedEvent,
  InstancesCreatedEvent,
} from 'src/domain/domain-events'
import PrismaService from 'src/services/prisma.service'
import { DomainEvent } from 'src/shared/domain-event'

@Injectable()
export default class DeployDomainEventListener {
  private deploymentEvents = new Subject<DomainEvent<DeploymentEditEvent>>()

  constructor(private prisma: PrismaService) {}

  watchEvents(deploymentId: string): Observable<DomainEvent<object>> {
    return this.deploymentEvents.pipe(filter(it => it.event.deploymentId === deploymentId))
  }

  @OnEvent(IMAGE_EVENT_ADD, { async: true })
  async onImagesAdded(event: ImagesAddedEvent) {
    const deployments = await this.prisma.deployment.findMany({
      select: {
        id: true,
      },
      where: {
        versionId: event.versionId,
      },
    })

    const createEvents: InstancesCreatedEvent[] = await Promise.all(
      deployments.map(async deployment => {
        const instances = await Promise.all(
          event.images.map(it =>
            this.prisma.instance.create({
              select: {
                configId: true,
                id: true,
                image: {
                  include: {
                    config: true,
                    registry: true,
                  },
                },
              },
              data: {
                deployment: { connect: { id: deployment.id } },
                image: { connect: { id: it.id } },
                config: { create: { type: 'instance' } },
              },
            }),
          ),
        )

        return {
          deploymentId: deployment.id,
          instances,
        }
      }),
    )

    this.sendEditEvents(DEPLOYMENT_EVENT_INSTACE_CREATE, createEvents)
  }

  @OnEvent(IMAGE_EVENT_DELETE)
  onImageDeleted(event: ImageDeletedEvent) {
    const deleteEvents: InstanceDeletedEvent[] = event.instances

    this.sendEditEvents(DEPLOYMENT_EVENT_INSTACE_DELETE, deleteEvents)
  }

  @OnEvent(DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE)
  onConfigBundlesUpdated(event: DeploymentConfigBundlesUpdatedEvent) {
    const editEvent: DomainEvent<DeploymentConfigBundlesUpdatedEvent> = {
      type: DEPLOYMENT_EVENT_CONFIG_BUNDLES_UPDATE,
      event,
    }

    this.deploymentEvents.next(editEvent)
  }

  private sendEditEvents(type: string, events: DeploymentEditEvent[]) {
    events.forEach(it =>
      this.deploymentEvents.next({
        type,
        event: it,
      }),
    )
  }
}
