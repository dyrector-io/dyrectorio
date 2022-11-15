import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { NotFoundError } from '@prisma/client/runtime'
import { catchError, Observable } from 'rxjs'
import { AlreadyExistsException, NotFoundException } from '../exception/errors'

const UNIQUE_CONSTRAINT_FAILED = 'P2002'

export default class PrismaErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => this.onError(err)))
  }

  onError(err: Error): any {
    // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === UNIQUE_CONSTRAINT_FAILED) {
        const meta = err.meta ?? ({} as any)
        const { target } = meta

        const hasName = target && target.includes('name')
        const property = hasName ? 'name' : target?.toString() ?? 'unknown'

        throw new AlreadyExistsException({
          message: `${property} taken`,
          property,
        })
      }
    }
    if (err instanceof NotFoundError) {
      throw new NotFoundException({
        property: 'prisma', // TODO(robot9706): Extend when NotFoundError is smarter
        value: err.message,
        message: err.message,
      })
    }

    throw err
  }
}
