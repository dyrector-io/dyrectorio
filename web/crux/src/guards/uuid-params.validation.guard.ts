import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

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
    const params = this.reflector.get<string[]>('params', context.getHandler())
    const req = context.switchToHttp().getRequest()

    console.log(params)

    // return if there is no given params
    if (!params) {
      return true
    }

    params.forEach(actualParam => {
      const id = req.params[actualParam] as string

      if (!validator.isUUID(id)) {
        throw new BadRequestException({
          message: 'Given UUID is Invalid.',
          property: actualParam,
          value: id,
        })
      }
    })

    return true
  }
}
