import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthorizedHttpRequest } from 'src/app/token/jwt-auth.guard'
import { PIPELINE_TOKEN_STRATEGY } from '../pipeline.jwt.strategy'

@Injectable()
export default class PipelineJwtAuthGuard extends AuthGuard(PIPELINE_TOKEN_STRATEGY) {
  private readonly logger = new Logger(PipelineJwtAuthGuard.name)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as AuthorizedHttpRequest
    if (req.identity) {
      this.logger.verbose('Skipping authorization. User is already authorized.')
      return true
    }

    const activated = await (super.canActivate(context) as Promise<boolean>)
    if (!activated) {
      return false
    }

    try {
      this.logger.verbose('Authorized. JWT was found legit.')
    } catch {
      this.logger.verbose('Unauthorized. JWT was found, but failed to authorize with kratos.')
      return false
    }

    return true
  }
}
