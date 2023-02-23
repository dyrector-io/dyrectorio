import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
import { Request, Response } from 'express'

interface Exception {
  name: string
  message: string
}

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception.name === 'NotFoundException') {
      return response.status(404).json({
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: exception.message,
      })
    }

    return response.status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    })
  }
}
