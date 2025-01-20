import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { filter, Observable, Subject } from 'rxjs'
import {
  IMAGE_EVENT_ADD,
  IMAGE_EVENT_DELETE,
  ImageDeletedEvent,
  ImageEvent,
  ImagesAddedEvent,
} from 'src/domain/domain-events'
import { DomainEvent } from 'src/shared/domain-event'

@Injectable()
export default class VersionDomainEventListener {
  private versionEvents = new Subject<DomainEvent<ImageEvent>>()

  watchEvents(versionId: string): Observable<DomainEvent<object>> {
    return this.versionEvents.pipe(filter(it => it.event.versionId === versionId))
  }

  @OnEvent(IMAGE_EVENT_ADD)
  onImagesAdded(event: ImagesAddedEvent) {
    const editEvent: DomainEvent<ImagesAddedEvent> = {
      type: IMAGE_EVENT_ADD,
      event,
    }

    this.versionEvents.next(editEvent)
  }

  @OnEvent(IMAGE_EVENT_DELETE)
  onImagesDeleted(event: ImageDeletedEvent) {
    const editEvent: DomainEvent<ImageDeletedEvent> = {
      type: IMAGE_EVENT_DELETE,
      event,
    }

    this.versionEvents.next(editEvent)
  }
}
