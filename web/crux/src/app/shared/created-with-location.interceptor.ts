import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { ServerResponse } from 'http'
import { map, Observable } from 'rxjs'
import { CreatedResponse, CREATED_WITH_LOCATION } from './created-with-location.decorator'

const FORWARDED_PREFIX_HEADER = 'x-forwarded-prefix'

class CreatedWithLocationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const active = Reflect.getMetadata(CREATED_WITH_LOCATION, context.getHandler())

    return next.handle().pipe(
      map(body => {
        if (!active) {
          return body
        }

        const createdRes = body as CreatedResponse<any>
        body = createdRes.body

        const serverRes = context.switchToHttp().getResponse() as ServerResponse
        const forwardedPrefix = serverRes.req.headers[FORWARDED_PREFIX_HEADER]

        const location = forwardedPrefix ? `${forwardedPrefix}${createdRes.url}` : createdRes.url

        serverRes.setHeader('Location', location)
        serverRes.statusCode = 201

        return body
      }),
    )
  }
}

export default CreatedWithLocationInterceptor
