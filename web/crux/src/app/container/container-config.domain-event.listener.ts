import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { filter, Observable, Subject } from 'rxjs'
import { CONTAINER_CONFIG_EVENT_UPDATE, ContainerConfigUpdatedEvent } from 'src/domain/domain-events'
import { DomainEvent } from 'src/shared/domain-event'

@Injectable()
export default class ContainerConfigDomainEventListener {
  private readonly configUpdatedEvents = new Subject<DomainEvent<ContainerConfigUpdatedEvent>>()

  watchEvents(configId: string): Observable<DomainEvent<object>> {
    return this.configUpdatedEvents.pipe(filter(it => it.event.id === configId))
  }

  @OnEvent(CONTAINER_CONFIG_EVENT_UPDATE)
  onContainerConfigUpdatedEvent(event: ContainerConfigUpdatedEvent) {
    this.configUpdatedEvents.next({
      type: CONTAINER_CONFIG_EVENT_UPDATE,
      event,
    })
  }
}
