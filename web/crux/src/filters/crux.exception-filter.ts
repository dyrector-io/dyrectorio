import { ArgumentsHost, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'
import PrismaErrorInterceptor from 'src/interceptors/prisma-error-interceptor'

export default abstract class CruxExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.verbose(exception)
    if (exception instanceof HttpException) {
      this.handleHttpException(exception, host)
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error('Unhandled Prisma Exception')
      const prismaError = PrismaErrorInterceptor.transformPrismaError(exception)
      this.handleHttpException(prismaError, host)
    } else {
      this.logger.error('Unhandled Exception')
      this.logger.error(`${exception.name}: ${exception.message}`, exception.stack)
      this.handleHttpException(
        new CruxInternalServerErrorException({
          message: 'UnhandledException',
        }),
        host,
      )
    }
  }

  protected abstract handleHttpException(exception: HttpException, host: ArgumentsHost)
}
