import {
  Type,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  PipeTransform,
  SetMetadata,
  Injectable,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'

const TRANSFORM_KEY = 'body-transform'

export const TransformResponse = (transform: Type<PipeTransform> | Type<PipeTransform>[]) =>
  SetMetadata(TRANSFORM_KEY, transform)

@Injectable()
export default class HttpResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const TransformTypes = this.reflector.get<Type<PipeTransform> | Type<PipeTransform>[]>(
      TRANSFORM_KEY,
      context.getHandler(),
    )
    if (!TransformTypes) {
      return next.handle()
    }

    const transforms = Array.isArray(TransformTypes) ? TransformTypes.map(Pipe => new Pipe()) : [new TransformTypes()]

    return next
      .handle()
      .pipe(map(it => transforms.reduce((data, transform) => transform.transform(data, { type: 'body' }), it)))
  }
}
