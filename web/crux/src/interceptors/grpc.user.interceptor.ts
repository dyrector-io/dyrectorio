import { Metadata } from '@grpc/grpc-js'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import KratosService from 'src/services/kratos.service'

const DISABLE_ACCESSED_BY_METADATA = 'disable-accessed-by-metadata'
export const METADATA_ACCESSED_BY_KEY = 'accessedby'

export const DisableAccessedByMetadata = () => SetMetadata(DISABLE_ACCESSED_BY_METADATA, true)

export const setAccessedByFromCookie = async (metadata: Metadata, kratos: KratosService) => {
  const cookie = metadata.getMap().cookie as string
  if (!cookie) {
    throw new UnauthorizedException()
  }

  const session = await kratos.getSessionByCookie(cookie)
  metadata.add(METADATA_ACCESSED_BY_KEY, session.identity.id)

  return session.identity.id
}

export const getAccessedBy = (metadata: Metadata) => metadata.getMap().accessedby as string

/**
 * gRPC request user interceptor. Injects the userID into the metadata
 * based on the cookie from the request.
 *
 * Disclaimer: Works only with gRPC controllers.
 */
@Injectable()
export default class GrpcUserInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly kratos: KratosService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const disabled = this.reflector.get<boolean>(DISABLE_ACCESSED_BY_METADATA, context.getHandler())
    if (disabled) {
      return next.handle()
    }

    const metadata = context.getArgByIndex<Metadata>(1)
    await setAccessedByFromCookie(metadata, this.kratos)

    return next.handle()
  }
}
