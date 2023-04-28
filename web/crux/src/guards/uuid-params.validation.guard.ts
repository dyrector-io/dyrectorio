import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UUID_PARAMS } from 'src/decorators/api-params.decorator'
import { CruxBadRequestException } from 'src/exception/crux-exception'

import validator from 'validator'

/**
 * UuidValidationGuard ensures that incoming requests contain valid UUIDs for
 * specified parameters, and rejects the request if any of the UUIDs
 * are invalid.
 */
@Injectable()
export default class UuidValidationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const params = this.reflector.get<string[]>(UUID_PARAMS, context.getHandler())
    const req = context.switchToHttp().getRequest()

    // return when there are no params defined
    if (!params) {
      return true
    }

    params.forEach(paramName => {
      const id = req.params[paramName] as string

      if (!validator.isUUID(id)) {
        throw new CruxBadRequestException({
          message: 'Invalid UUID parameter.',
          property: paramName,
          value: id,
        })
      }
    })

    return true
  }
}
