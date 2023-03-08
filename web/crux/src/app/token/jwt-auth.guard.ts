import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RequiredError } from '@ory/kratos-client/dist/base'
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
      } catch (error) {
        // No valid session cookie found check the JWT Token
        if (error.response.status === 401) {
          if (req.headers.authorization) {
            return super.canActivate(context) as boolean
          }
        }
        throw error as RequiredError
      }
    }

    return super.canActivate(context) as boolean
  }
}

type ExtendedHttpRequest = http.IncomingMessage & {
  body: any
}
