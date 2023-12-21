import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { DEPLOY_TOKEN_STRATEGY } from '../deploy.jwt.strategy'
import CustomJwtAuthGuard from 'src/guards/custom.jwt-auth.guard'

@Injectable()
export default class DeployJwtAuthGuard extends AuthGuard(DEPLOY_TOKEN_STRATEGY) {
  private readonly guard = new CustomJwtAuthGuard(
    new Logger(DeployJwtAuthGuard.name),
    ctx => super.canActivate(ctx) as Promise<boolean>,
  )

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.guard.canActivate(context)
  }
}
