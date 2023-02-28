import { Metadata } from '@grpc/grpc-js'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export default class BodyPipeTransform<T> implements PipeTransform {
  async transform(value: T | Metadata, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      return this.transformBody(value as T)
    }

    return value
  }

  async transformBody(request: T): Promise<T> {
    return request
  }
}
