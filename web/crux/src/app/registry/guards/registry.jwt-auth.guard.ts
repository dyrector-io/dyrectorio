import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import CustomJwtAuthGuard from 'src/guards/custom.jwt-auth.guard'
import { REGISTRY_HOOK_STRATEGY } from '../registry.jwt.strategy'

@Injectable()
export default class RegistryJwtAuthGuard extends AuthGuard(REGISTRY_HOOK_STRATEGY) {
  private readonly guard = new CustomJwtAuthGuard(
    new Logger(RegistryJwtAuthGuard.name),
    ctx => super.canActivate(ctx) as Promise<boolean>,
  )

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.guard.canActivate(context)
  }
}
