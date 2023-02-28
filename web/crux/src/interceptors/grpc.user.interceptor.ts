import { Metadata } from '@grpc/grpc-js'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common/exceptions'
import { Reflector } from '@nestjs/core'
import { Identity } from '@ory/kratos-client'
import { Observable } from 'rxjs'
import KratosService from 'src/services/kratos.service'

export const DISABLE_IDENTITY = 'disable-accessed-by-metadata'
export const METADATA_IDENTITY = 'identity'

export const DisableIdentity = () => SetMetadata(DISABLE_IDENTITY, true)

export const setIdentityFromCookie = async (metadata: Metadata, kratos: KratosService) => {
  const cookie = metadata.getMap().cookie as string
  if (!cookie) {
    throw new UnauthorizedException()
  }

  const session = await kratos.getSessionByCookie(cookie)
  metadata.add(METADATA_IDENTITY, JSON.stringify(session.identity))

  return session.identity
}

export const getIdentity = (metadata: Metadata) => {
  const json = metadata.getMap().identity as string
  if (!json) {
    return null
  }
  return JSON.parse(json) as Identity
}

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
    const disabled = this.reflector.get<boolean>(DISABLE_IDENTITY, context.getHandler())
    if (disabled) {
      return next.handle()
    }

    const metadata = context.getArgByIndex<Metadata>(1)
    await setIdentityFromCookie(metadata, this.kratos)

    return next.handle()
  }
}
