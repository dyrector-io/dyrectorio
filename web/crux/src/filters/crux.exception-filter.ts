import { ArgumentsHost, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { CruxInternalServerErrorException } from 'src/exception/crux-exception'

export default abstract class CruxExceptionFilter implements ExceptionFilter {
  constructor(protected readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.verbose(exception)
    if (exception instanceof HttpException) {
      this.handleHttpException(exception, host)
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
