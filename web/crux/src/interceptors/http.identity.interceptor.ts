import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common/decorators'
import { Identity } from '@ory/kratos-client'
import { Observable } from 'rxjs'
import KratosService from 'src/services/kratos.service'

interface RequestWithIdentity {
  identity: Identity
}

@Injectable()
export class HttpIdentityInterceptor implements NestInterceptor {
  constructor(private kratos: KratosService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const userId = req.user?.data?.sub
    if (userId) {
      const body = req.body as RequestWithIdentity
      body.identity = await this.kratos.getIdentityById(userId)
    }

    return next.handle()
  }
}

export const IdentityFromRequest = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const body = context.switchToHttp().getRequest().body as RequestWithIdentity
  return body.identity
})
