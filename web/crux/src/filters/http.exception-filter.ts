import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import CruxExceptionFilter from './crux.exception-filter'

@Catch()
export default class HttpExceptionFilter extends CruxExceptionFilter {
  constructor() {
    super(new Logger('HTTP'))
  }

  protected handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const contextType = host.getType()
    if (contextType === 'http') {
      const ctx = host.switchToHttp()
      const status = exception.getStatus()
      const httpRes: Response = ctx.getResponse()
      const httpReq: Request = ctx.getRequest()

      const res = exception.getResponse()

      this.logger.error(
        `${exception.getStatus()} ${httpReq.method} ${httpReq.url} ${
          typeof res === 'object' ? JSON.stringify(res) : res
        }`,
      )

      httpRes.status(status).json(res)
      return
    }

    this.logger.error(`HttpExceptionFilter was executed on a ${contextType} context`)
    throw Error('Invalid context.')
  }
}
