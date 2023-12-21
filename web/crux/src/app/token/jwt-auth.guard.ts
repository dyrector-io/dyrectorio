import { createParamDecorator, ExecutionContext, Injectable, Logger, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Identity } from '@ory/kratos-client'
import { Request as ExpressRequest } from 'express'
import { RequestAuthenticationData } from 'src/domain/identity'
import { CruxUnauthorizedException } from 'src/exception/crux-exception'
import KratosService, { hasKratosSession } from 'src/services/kratos.service'
import { WS_TYPE_UNSUBSCRIBE, WsClient } from 'src/websockets/common'

export type AuthStrategyType = 'user-token' | 'deploy-token' | 'registry-hook' | 'disabled'
export const AUTH_STRATEGY = 'auth-strategy'
export const AuthStrategy = (strategy: AuthStrategyType) => SetMetadata(AUTH_STRATEGY, strategy)
export const DisableAuth = () => AuthStrategy('disabled')
export const authStrategyOfContext = (context: ExecutionContext, reflector: Reflector) =>
  reflector.get<AuthStrategyType>(AUTH_STRATEGY, context.getHandler()) ?? 'user-token'

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name)

  constructor(
    private kratos: KratosService,
    private reflector: Reflector,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const strategy = authStrategyOfContext(context, this.reflector)
    if (strategy === 'disabled') {
      this.logger.verbose(`Authorized. Guard was for path.`)
      return true
    }

    const type = context.getType()

    if (type === 'http') {
      return await this.canActivateHttp(context, context.switchToHttp().getRequest(), strategy)
    }
    if (type === 'ws') {
      return this.canActivateWs(context)
    }

    this.logger.error(`Invalid context ${type}`)
    return false
  }

  private async canActivateHttp(
    context: ExecutionContext,
    req: AuthorizedHttpRequest,
    strategy: AuthStrategyType,
  ): Promise<boolean> {
    if (hasKratosSession(req)) {
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
    let activated = false
    try {
      activated = await (super.canActivate(context) as Promise<boolean>)
    } catch {
      /* EMPTY */
    }

    if (!activated) {
      this.logger.verbose('Failed to authorize with jwt.')
      // let the DeployJwtAuthGuard decide if the jwt is valid
      return strategy === 'deploy-token' || strategy === 'registry-hook'
    }

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
    const message = this.reflector.get('message', context.getHandler())
    if (client.disconnecting) {
      // NOTE(@robot9706): When a client is disconnecting disallow any handlers
      // except WsUnsubscribe for cleanup
      return message === WS_TYPE_UNSUBSCRIBE
    }

    const req = client.connectionRequest as AuthorizedHttpRequest

    const now = new Date().getTime()
    const { sessionExpiresAt } = req

    if (!sessionExpiresAt || sessionExpiresAt <= now) {
      this.logger.debug('WebSocket session expired.')

      throw new CruxUnauthorizedException()
    }

    return !!req.identity
  }
}

export type AuthorizedHttpRequest = ExpressRequest & RequestAuthenticationData

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
