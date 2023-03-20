import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Identity } from '@ory/kratos-client'
import http from 'http'
import KratosService from 'src/services/kratos.service'

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private kratos: KratosService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as ExtendedHttpRequest

    if (req.headers.cookie) {
      try {
        // check the cookie for a valid session
        const session = await this.kratos.getSessionByCookie(req.headers.cookie)
        req.body.identity = session.identity
        return true
      } catch {
        /* ignored */
      }
    }

    const activated = super.canActivate(context) as boolean
    if (activated) {
      const userId = req.user.data.sub
      try {
        req.body.identity = await this.kratos.getIdentityById(userId)
      } catch {
        return false
      }
    }

    return activated
  }
}

type ExtendedHttpRequest = http.IncomingMessage & {
  body: {
    identity: Identity
  }
  user: any
}

export const identityOfContext = (context: ExecutionContext): Identity => {
  const req = context.switchToHttp().getRequest() as ExtendedHttpRequest
  return req.body.identity
}

export const IdentityFromRequest = createParamDecorator((_: unknown, context: ExecutionContext) =>
  identityOfContext(context),
)
