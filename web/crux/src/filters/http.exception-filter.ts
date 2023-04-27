import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'
import CruxExceptionFilter from './crux.exception-filter'

@Catch()
export default class HttpExceptionFilter extends CruxExceptionFilter {
  constructor() {
    super(new Logger(HttpExceptionFilter.name))
  }

  protected handleHttpException(exception: HttpException, host: ArgumentsHost) {
    const res = exception.getResponse()
    this.logger.error(`${exception.getStatus()} ${typeof res === 'object' ? JSON.stringify(res) : res}`)

    const contextType = host.getType()
    if (contextType === 'http') {
      const ctx = host.switchToHttp()
      const status = exception.getStatus()
      const httpRes: Response = ctx.getResponse()

      httpRes.status(status).json(res)
      return
    }

    this.logger.error(`DyoExceptionFilter was executed on a ${contextType} context`)
    throw Error('Invalid context.')
  }
}
