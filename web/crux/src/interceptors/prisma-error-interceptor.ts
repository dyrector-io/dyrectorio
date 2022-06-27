import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { catchError, Observable } from 'rxjs'
import { AlreadyExistsException } from '../exception/errors'

export class PrismaErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => this.onError(err)))
  }

  onError(err: Error): any {
    // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === UNIQUE_CONSTRAINT_FAILED) {
        const meta = err.meta ?? ({} as any)
        const target: string[] = meta.target

        const hasName = target && target.includes('name')
        const property = hasName ? 'name' : target?.toString() ?? 'unknown'

        throw new AlreadyExistsException({
          message: `${property} taken`,
          property,
        })
      }
    }

    throw err
  }
}

const UNIQUE_CONSTRAINT_FAILED = 'P2002'
