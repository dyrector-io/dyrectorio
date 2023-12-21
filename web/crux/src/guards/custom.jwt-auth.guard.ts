import { CanActivate, ExecutionContext, Logger } from '@nestjs/common'
import { AuthorizedHttpRequest } from 'src/app/token/jwt-auth.guard'

export type JwtCanActivate = (context: ExecutionContext) => Promise<boolean>

export default class CustomJwtAuthGuard implements CanActivate {
  constructor(private readonly logger: Logger, private readonly jwtCanActivate: JwtCanActivate) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
    if (req.identity) {
      this.logger.verbose('Skipping authorization. User is already authorized.')
      return true
    }

    const activated = await this.jwtCanActivate(context)
    if (!activated) {
      return false
    }

    return true
  }
}
