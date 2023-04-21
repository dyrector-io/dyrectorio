import { createParamDecorator, ExecutionContext, Injectable, Logger, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Identity, Session } from '@ory/kratos-client'
import http from 'http'
import KratosService from 'src/services/kratos.service'
import { AuthPayload } from 'src/shared/models'
import { WsClient } from 'src/websockets/common'

export const DISABLE_AUTH = 'disable-auth'
export const DisableAuth = () => SetMetadata(DISABLE_AUTH, true)

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name)

  constructor(private kratos: KratosService, private reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const disableAuth = this.reflector.get<boolean>(DISABLE_AUTH, context.getHandler())
    if (disableAuth) {
      return true
    }

    const type = context.getType()

    if (type === 'http') {
      return await this.canActivateHttp(context, context.switchToHttp().getRequest())
    }
    if (type === 'ws') {
      return this.canActivateWs(context)
    }

    this.logger.error(`Invalid context ${type}`)
    return false
  }

  private async canActivateHttp(context: ExecutionContext, req: AuthorizedHttpRequest): Promise<boolean> {
    if (req.headers.cookie?.includes('ory_kratos_session=')) {
      try {
        // check the cookie for a valid session
        const session = await this.kratos.getSessionByCookie(req.headers.cookie)
        req.identity = session.identity
        return true
      } catch {
        /* ignored */
      }
    }

    const activated = await (super.canActivate(context) as Promise<boolean>)

    if (activated) {
      const userId = req.user.data.sub
      try {
        req.identity = await this.kratos.getIdentityById(userId)
      } catch {
        return false
      }
    }

    return activated
  }

  private canActivateWs(context: ExecutionContext): boolean {
    const client: WsClient = context.switchToWs().getClient()
    const req = client.connectionRequest as AuthorizedHttpRequest
    if (req.session) {
      const expiresAt = new Date(req.session.expires_at)
      const now = new Date()

      if (expiresAt.getTime() <= now.getTime()) {
        this.logger.debug('WebSocket session expired')
        client.close()
        // TODO(@m8vago): send dyoerror?
        return false
      }
      return true
    }

    // TODO(@m8vago): handle jwt exp

    return !!req.identity
  }
}

export type AuthorizedHttpRequest = http.IncomingMessage & {
  session: Session
  identity: Identity
  user: {
    data: AuthPayload
  }
}

export const identityOfRequest = (context: ExecutionContext): Identity => {
  const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
  return req.identity
}

export const IdentityFromRequest = createParamDecorator(
  (_: unknown, context: ExecutionContext): Identity => identityOfRequest(context),
)

export const identityOfSocket = (context: ExecutionContext): Identity => {
  const client: WsClient = context.switchToWs().getClient()
  const req = client.connectionRequest as AuthorizedHttpRequest
  return req.identity
}

export const IdentityFromSocket = createParamDecorator(
  (_: unknown, context: ExecutionContext): Identity => identityOfSocket(context),
)
