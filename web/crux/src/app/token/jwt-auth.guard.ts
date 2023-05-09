import { createParamDecorator, ExecutionContext, Injectable, Logger, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Identity } from '@ory/kratos-client'
import http from 'http'
import { JwtToken } from 'src/domain/identity'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import KratosService from 'src/services/kratos.service'
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
      this.logger.verbose(`Authorized. Guard was disabled for path.`)
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
        req.sessionExpiresAt = new Date(session.expires_at).getTime()
        this.logger.verbose(`Authorized. Kratos cookie was found legit.`)
        return true
      } catch (err) {
        this.logger.verbose('Failed to authorize with kratos by cookie', err)
      }
    }

    this.handleWsConnection(req)
    const activated = await (super.canActivate(context) as Promise<boolean>)

    if (activated) {
      const jwt = req.user
      const userId = jwt.data.sub
      try {
        req.identity = await this.kratos.getIdentityById(userId)
        req.sessionExpiresAt = jwt.exp
        this.logger.verbose('Authorized. JWT was found legit.')
      } catch {
        this.logger.verbose('Unauthorized. JWT was found, but failed to authorize with kratos.')
        return false
      }
    }

    return activated
  }

  private handleWsConnection(req: AuthorizedHttpRequest): void {
    const [path, paramsString] = req.url.split('?')
    if (path !== '/') {
      return
    }

    const [paramName, token] = paramsString.split('=')
    if (paramName !== 'token' || !token) {
      return
    }

    this.logger.debug('Authorizing ws connection with token.')
    req.headers.authorization = `Bearer ${token}`
  }

  private canActivateWs(context: ExecutionContext): boolean {
    const client: WsClient = context.switchToWs().getClient()
    const req = client.connectionRequest as AuthorizedHttpRequest

    const now = new Date().getTime()
    const { sessionExpiresAt } = req

    if (!sessionExpiresAt || sessionExpiresAt <= now) {
      this.logger.debug('WebSocket session expired.')
      client.close()
      throw new CruxUnauthorizedException()
    }

    return !!req.identity
  }
}

export type AuthorizedHttpRequest = http.IncomingMessage & {
  sessionExpiresAt: number // epoch millis
  identity: Identity
  user: JwtToken
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
