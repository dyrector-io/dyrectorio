import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Observable, catchError } from 'rxjs'
import {
  CruxBadRequestException,
  CruxConflictException,
  CruxException,
  CruxExceptionOptions,
  CruxNotFoundException,
} from 'src/exception/crux-exception'

type NotFoundErrorMappings = { [P in Prisma.ModelName]: string }

// Prisma Error message reference
// https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
const UNIQUE_CONSTRAINT_FAILED = 'P2002'
const NOT_FOUND = 'P2025'
const UUID_INVALID = 'P2003'

export default class PrismaErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(catchError(err => this.onError(context, err)))
  }

  onError(_context: ExecutionContext, err: Error): any {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const exception = PrismaErrorInterceptor.transformPrismaError(err)
      if (exception != null) {
        throw exception
      }
    }

    throw err
  }

  public static transformPrismaError(err: Prisma.PrismaClientKnownRequestError): CruxException {
    if (err.code === UNIQUE_CONSTRAINT_FAILED) {
      const meta = err.meta ?? ({} as any)
      const { target } = meta

      const hasName = target && target.includes('name')
      const property = hasName ? 'name' : target?.toString() ?? 'unknown'

      const error: CruxExceptionOptions = {
        message: `${property} taken`,
        property,
      }

      return new CruxConflictException(error)
    }

    if (err.code === NOT_FOUND) {
      const error = {
        property: this.prismaMessageToProperty(err.message),
        message: err.message,
      }

      return new CruxNotFoundException(error)
    }

    if (err.code === UUID_INVALID) {
      return new CruxBadRequestException({
        message: 'Invalid uuid',
      })
    }

    return null
  }

  public static prismaMessageToProperty(message: string) {
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
    RegistryToken: 'registryToken',
    Node: 'node',
    Project: 'project',
    Version: 'version',
    Image: 'image',
    ContainerConfig: 'containerConfig',
    Deployment: 'deployment',
    DeploymentEvent: 'deploymentEvent',
    DeploymentToken: 'deploymentToken',
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
    Pipeline: 'pipeline',
    PipelineRun: 'pipelineRun',
    PipelineEventWatcher: 'pipelineEventWatcher',
    NodeEvent: 'nodeEvent',
    NodeToken: 'token', // its thrown on agent connections, so in that context this is a gRPC token
    ConfigBundle: 'configBundle',
    ConfigBundleOnDeployments: 'configBundleOnDeployments',
    QualityAssuranceConfig: 'qualityAssuranceConfig',
  }
}
