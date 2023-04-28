import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { ImageDto } from './image.dto'
import { ImageEvent } from './image.event'

@Injectable()
export default class ImageEventService {
  private readonly events = new Subject<ImageEvent>()

  public imagesAddedToVersion(versionId: string, images: ImageDto[]) {
    this.events.next({
      type: 'create',
      versionId,
      images,
    })
  }

  public imageUpdated(versionId: string, image: ImageDto) {
    this.events.next({
      type: 'update',
      versionId,
      images: [image],
    })
  }

  public imageDeletedFromVersion(versionId: string, imageId: string) {
    this.events.next({
      type: 'delete',
      versionId,
      imageId,
    })
  }

  public watchEvents(): Observable<ImageEvent> {
    return this.events.asObservable()
  }
}
