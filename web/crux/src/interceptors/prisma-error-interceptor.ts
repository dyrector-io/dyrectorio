import { CallHandler, ConflictException, ExecutionContext, NestInterceptor, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { catchError, Observable } from 'rxjs'

type NotFoundErrorMappings = { [P in Prisma.ModelName]: string }

// Prisma Error message reference
// https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
const UNIQUE_CONSTRAINT_FAILED = 'P2002'
const NOT_FOUND = 'P2025'

export default class PrismaErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => this.onError(err)))
  }

  onError(err: Error): any {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === UNIQUE_CONSTRAINT_FAILED) {
        const meta = err.meta ?? ({} as any)
        const { target } = meta

        const hasName = target && target.includes('name')
        const property = hasName ? 'name' : target?.toString() ?? 'unknown'

        throw new ConflictException({
          message: `${property} taken`,
          property,
        })
      } else if (err.code === NOT_FOUND) {
        throw new NotFoundException({
          property: this.prismaMessageToProperty(err.message),
          message: err.message,
        })
      }
    }

    throw err
  }

  private prismaMessageToProperty(message: string) {
    const FIRST_PART = 'No '
    const SECOND_PART = ' found'

    const after = message.indexOf(FIRST_PART)
    const before = message.lastIndexOf(SECOND_PART)
    if (after < 0 || before < 0) {
      return null
    }

    const tableName = message.substring(after + FIRST_PART.length, before)

    return PrismaErrorInterceptor.NOT_FOUND_ERRORS[tableName]
  }

  private static readonly NOT_FOUND_ERRORS: NotFoundErrorMappings = {
    Registry: 'registry',
    Node: 'node',
    Product: 'product',
    Version: 'version',
    Image: 'image',
    ContainerConfig: 'containerConfig',
    Deployment: 'deployment',
    DeploymentEvent: 'deploymentEvent',
    Instance: 'instance',
    InstanceContainerConfig: 'instanceConfig',
    UserInvitation: 'invitation',
    VersionsOnParentVersion: 'versionRelation',
    UsersOnTeams: 'team',
    Team: 'team',
    AuditLog: 'auditLog',
    Notification: 'notification',
    NotificationEvent: 'notificationEvent',
    Token: 'token',
    Storage: 'storage',
  }
}
