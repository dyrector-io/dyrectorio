import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import CustomJwtAuthGuard from 'src/guards/custom.jwt-auth.guard'
import { PIPELINE_TOKEN_STRATEGY } from '../pipeline.jwt.strategy'

@Injectable()
export default class PipelineJwtAuthGuard extends AuthGuard(PIPELINE_TOKEN_STRATEGY) {
  private readonly guard = new CustomJwtAuthGuard(
    new Logger(PipelineJwtAuthGuard.name),
    ctx => super.canActivate(ctx) as Promise<boolean>,
  )

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.guard.canActivate(context)
  }
}
